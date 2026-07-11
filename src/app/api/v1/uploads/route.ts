import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { waitUntil } from "@vercel/functions";
import { prisma } from "@/lib/prisma";
import { captureMetadataSchema } from "@/lib/validation";
import { uploadObject } from "@/lib/r2";
import { PLAN_LIMITS, hasAIAccess } from "@/lib/plans";
import { runPhotoAiPipeline } from "@/lib/ai-pipeline";

// POST /api/v1/uploads — Volume 7 (Upload API)
// Validation: JPEG/HEIC/WebP, max size configurable, auto compression
// (compression already happens client-side in useCamera before this runs).
//
// Storage: Cloudflare R2 (S3-compatible) — lihat src/lib/r2.ts dan
// .env.example untuk env vars yang dibutuhkan (Volume 6).

const ALLOWED_TYPES = ["image/jpeg", "image/webp", "image/heic"];
const MAX_SIZE_BYTES = 12 * 1024 * 1024; // 12MB safety ceiling

// Sentinel errors dilempar dari dalam transaction saat kuota sudah penuh,
// supaya bisa dibedakan dari error database lain di catch block.
class RollFinishedError extends Error {}
class PhotoLimitReachedError extends Error {}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const eventCode = form.get("eventCode");

  if (!(file instanceof File) || typeof eventCode !== "string") {
    return NextResponse.json(
      { success: false, message: "Payload tidak lengkap", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const metaParsed = captureMetadataSchema.safeParse({
    filmType: form.get("filmType"),
    deviceId: form.get("deviceId"),
    orientation: form.get("orientation"),
    timestamp: form.get("timestamp"),
  });

  if (!metaParsed.success) {
    return NextResponse.json(
      { success: false, message: "Metadata tidak valid", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: "Format file tidak didukung", code: "INVALID_FILE_TYPE" },
      { status: 422 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: "Ukuran file terlalu besar", code: "FILE_TOO_LARGE" },
      { status: 422 }
    );
  }

  const event = await prisma.event.findFirst({
    where: { slug: eventCode, deletedAt: null },
  });

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (event.status === "ENDED" || event.status === "ARCHIVED") {
    return NextResponse.json(
      { success: false, message: "Event sudah tidak menerima foto", code: "EVENT_ENDED" },
      { status: 403 }
    );
  }

  // Full lock (Blueprint v2.1 — Masa Aktif): sekali lewat activeUntil, guest
  // tidak bisa upload sama sekali lagi, terlepas dari status event-nya.
  if (event.activeUntil && event.activeUntil.getTime() < Date.now()) {
    return NextResponse.json(
      {
        success: false,
        message: "Masa aktif event ini sudah berakhir, roll film ditutup.",
        code: "EVENT_EXPIRED",
      },
      { status: 403 }
    );
  }

  // Cek murah dulu pakai angka yang sudah nempel di row event/guest (tanpa
  // query count() terpisah) — supaya kalau jelas-jelas sudah penuh, kita
  // nggak buang waktu/biaya proses & upload file ke R2 dulu. Ini BUKAN
  // penjagaan utama (masih bisa race di request yang nyaris bersamaan),
  // makanya nanti tetap direservasi ulang secara atomic tepat sebelum
  // Photo dibuat di bawah.
  const guest = await prisma.guest.findFirst({
    where: { eventId: event.id, deviceId: metaParsed.data.deviceId },
  });

  if (guest?.isBanned) {
    return NextResponse.json(
      { success: false, message: "Kamu tidak dapat mengunggah foto di event ini", code: "GUEST_BANNED" },
      { status: 403 }
    );
  }

  if (event.shotLimit !== null && guest && guest.shotCount >= event.shotLimit) {
    return NextResponse.json(
      { success: false, message: "Jatah foto sudah habis", code: "ROLL_FINISHED" },
      { status: 403 }
    );
  }

  // Enforcement (Blueprint v2.1): maxPhotos adalah kuota TOTAL event (semua
  // tamu digabung), terpisah dari shotLimit per tamu di atas. maxVideos belum
  // ditegakkan di sini karena fitur perekaman video belum ada di Kenang
  // Camera (Photo model belum punya kolom mediaType) — tambahkan pengecekan
  // ini begitu upload video diimplementasikan.
  const maxPhotos = PLAN_LIMITS[event.plan].limits.maxPhotos;
  if (maxPhotos !== null && event.photoCount >= maxPhotos) {
    return NextResponse.json(
      {
        success: false,
        message: `Kuota foto event ini (paket ${PLAN_LIMITS[event.plan].name}) sudah penuh.`,
        code: "PHOTO_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const owner = await prisma.user.findUnique({
    where: { id: event.ownerId },
    select: { role: true, subscription: { select: { plan: true } } },
  });

  // Admin tidak terkena batasan paket harga (mis. watermark) untuk event
  // milik mereka sendiri, terlepas dari status subscription-nya.
  const isFreePlan =
    owner?.role !== "ADMIN" && (!owner?.subscription || owner.subscription.plan === "KINCAI");

  const { storageKey, thumbnailKey, width, height } = await saveToR2(
    file,
    event.id,
    isFreePlan
  );

  // PENTING: reservasi kuota (photoCount event & shotCount guest) dan insert
  // Photo digabung jadi SATU transaction, pakai updateMany({ ...Count: { lt } })
  // — bukan count() lalu create() terpisah. Kalau dipisah, banyak upload yang
  // hampir bersamaan bisa sama-sama lolos pengecekan di atas sebelum salah
  // satu selesai insert, sehingga kuota bisa kebobolan. UPDATE ... WHERE di
  // Postgres itu atomic per baris, jadi ini aman dari race condition walau
  // ada banyak tamu upload berbarengan.
  let photo;
  try {
    photo = await prisma.$transaction(async (tx) => {
      if (maxPhotos !== null) {
        const reserved = await tx.event.updateMany({
          where: { id: event.id, photoCount: { lt: maxPhotos } },
          data: { photoCount: { increment: 1 } },
        });
        if (reserved.count === 0) throw new PhotoLimitReachedError();
      } else {
        await tx.event.update({ where: { id: event.id }, data: { photoCount: { increment: 1 } } });
      }

      if (event.shotLimit !== null && guest) {
        const reservedGuest = await tx.guest.updateMany({
          where: { id: guest.id, shotCount: { lt: event.shotLimit } },
          data: { shotCount: { increment: 1 } },
        });
        if (reservedGuest.count === 0) throw new RollFinishedError();
      } else if (guest) {
        await tx.guest.update({ where: { id: guest.id }, data: { shotCount: { increment: 1 } } });
      }

      return tx.photo.create({
        data: {
          eventId: event.id,
          guestId: guest?.id,
          storageKey,
          thumbnailKey,
          width,
          height,
          filmType: metaParsed.data.filmType,
          frameType: metaParsed.data.orientation,
        },
      });
    });
  } catch (err) {
    if (err instanceof PhotoLimitReachedError) {
      return NextResponse.json(
        {
          success: false,
          message: `Kuota foto event ini (paket ${PLAN_LIMITS[event.plan].name}) sudah penuh.`,
          code: "PHOTO_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
    if (err instanceof RollFinishedError) {
      return NextResponse.json(
        { success: false, message: "Jatah foto sudah habis", code: "ROLL_FINISHED" },
        { status: 403 }
      );
    }
    throw err;
  }

  await prisma.analytics.upsert({
    where: { eventId: event.id },
    update: { totalPhotos: { increment: 1 }, storageUsed: { increment: file.size } },
    create: {
      eventId: event.id,
      totalPhotos: 1,
      totalGuests: guest ? 1 : 0,
      storageUsed: file.size,
    },
  });

  // AI Features v3.0 (Best Shot + Smart Gallery): dijalankan asynchronous di
  // background pakai waitUntil, JANGAN di-await — supaya guest tidak nunggu
  // OpenAI selesai sebelum dapat respons upload. Hanya jalan untuk event di
  // plan yang punya akses AI (Gunung Tujuh ke atas), biar tidak keluar biaya
  // OpenAI percuma untuk event Kincai/Kurinji.
  if (hasAIAccess(event.plan)) {
    waitUntil(runPhotoAiPipeline(photo.id));
  }

  return NextResponse.json({
    success: true,
    data: { photoId: photo.id, storageKey, thumbnailKey },
  });
}

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

// Cached at module scope so we only read + inspect the logo file once per
// server instance, not on every single photo upload.
let logoCache: { base64: string; width: number; height: number } | null = null;

async function getLogo() {
  if (!logoCache) {
    const buf = fs.readFileSync(LOGO_PATH);
    const meta = await sharp(buf).metadata();
    logoCache = {
      base64: buf.toString("base64"),
      width: meta.width ?? 1243,
      height: meta.height ?? 632,
    };
  }
  return logoCache;
}

async function applyWatermark(buffer: Buffer, width: number, height: number) {
  const logo = await getLogo();
  const logoRatio = logo.width / logo.height;

  // Tile size scales with the photo so the pattern density stays consistent
  // across different resolutions (matches the diagonal repeating look of
  // stock-photo "sample" watermarks, just using our logo instead of text).
  const tileSize = Math.max(140, Math.round(width * 0.24));
  const logoWidth = Math.round(tileSize * 0.62);
  const logoHeight = Math.round(logoWidth / logoRatio);
  const offsetX = Math.round((tileSize - logoWidth) / 2);
  const offsetY = Math.round((tileSize - logoHeight) / 2);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="watermark-tile"
          width="${tileSize}"
          height="${tileSize}"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-30)"
        >
          <image
            href="data:image/png;base64,${logo.base64}"
            x="${offsetX}"
            y="${offsetY}"
            width="${logoWidth}"
            height="${logoHeight}"
            opacity="0.35"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#watermark-tile)" />
    </svg>
  `;

  return sharp(buffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function saveToR2(file: File, eventId: string, isFreePlan: boolean) {
  let buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}_${randomUUID()}.jpg`;

  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? null;
  const height = metadata.height ?? null;

  if (isFreePlan && width && height) {
    buffer = await applyWatermark(buffer, width, height);
  }

  const storageKey = `events/${eventId}/original/${filename}`;
  const thumbnailKey = `events/${eventId}/thumb/${filename}`;

  const thumbnailBuffer = await sharp(buffer)
    .resize({ width: 640, withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();

  await Promise.all([
    uploadObject(storageKey, buffer, "image/jpeg"),
    uploadObject(thumbnailKey, thumbnailBuffer, "image/jpeg"),
  ]);

  return { storageKey, thumbnailKey, width, height };
}
