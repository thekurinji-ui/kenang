import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { captureMetadataSchema } from "@/lib/validation";
import { uploadObject } from "@/lib/r2";
import { PLAN_LIMITS } from "@/lib/plans";

// POST /api/v1/uploads — Volume 7 (Upload API)
// Validation: JPEG/HEIC/WebP, max size configurable, auto compression
// (compression already happens client-side in useCamera before this runs).
//
// Storage: Cloudflare R2 (S3-compatible) — lihat src/lib/r2.ts dan
// .env.example untuk env vars yang dibutuhkan (Volume 6).

const ALLOWED_TYPES = ["image/jpeg", "image/webp", "image/heic"];
const MAX_SIZE_BYTES = 12 * 1024 * 1024; // 12MB safety ceiling

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

  if (event.shotLimit !== null) {
    const totalForDevice = await prisma.photo.count({
      where: {
        eventId: event.id,
        guest: { deviceId: metaParsed.data.deviceId },
      },
    });
    if (totalForDevice >= event.shotLimit) {
      return NextResponse.json(
        { success: false, message: "Jatah foto sudah habis", code: "ROLL_FINISHED" },
        { status: 403 }
      );
    }
  }

  // Enforcement (Blueprint v2.1): maxPhotos adalah kuota TOTAL event (semua
  // tamu digabung), terpisah dari shotLimit per tamu di atas. maxVideos belum
  // ditegakkan di sini karena fitur perekaman video belum ada di Kenang
  // Camera (Photo model belum punya kolom mediaType) — tambahkan pengecekan
  // ini begitu upload video diimplementasikan.
  const maxPhotos = PLAN_LIMITS[event.plan].limits.maxPhotos;
  if (maxPhotos !== null) {
    const totalForEvent = await prisma.photo.count({ where: { eventId: event.id } });
    if (totalForEvent >= maxPhotos) {
      return NextResponse.json(
        {
          success: false,
          message: `Kuota foto event ini (paket ${PLAN_LIMITS[event.plan].name}) sudah penuh.`,
          code: "PHOTO_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  const guest = await prisma.guest.findFirst({
    where: { eventId: event.id, deviceId: metaParsed.data.deviceId },
  });

  if (guest?.isBanned) {
    return NextResponse.json(
      { success: false, message: "Kamu tidak dapat mengunggah foto di event ini", code: "GUEST_BANNED" },
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

  const photo = await prisma.photo.create({
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

  return NextResponse.json({
    success: true,
    data: { photoId: photo.id, storageKey, thumbnailKey },
  });
}

const WATERMARK_TEXT = "Kenang Kurinji";

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

async function applyWatermark(buffer: Buffer, width: number, height: number) {
  const fontSize = Math.max(24, Math.round(width * 0.07));
  const svg = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark {
          fill: rgba(255,255,255,0.55);
          font-size: ${fontSize}px;
          font-family: sans-serif;
          font-weight: 700;
        }
      </style>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        class="watermark"
        stroke="rgba(0,0,0,0.4)"
        stroke-width="1.5"
      >${WATERMARK_TEXT}</text>
    </svg>
  `;

  return sharp(buffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();
}
