import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadObject, deleteObject, publicUrl } from "@/lib/r2";

// POST /api/v1/events/{id}/cover — Volume: Event Cover Upload
// Host/client upload gambar cover acara. Gambar ini yang tampil di
// EventCoverScreen (src/components/camera/event-cover-screen.tsx) begitu
// tamu scan QR dan membuka halaman /e/{eventCode}, sebelum masuk kamera.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_WIDTH = 1600;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session.user.id, deletedAt: null },
  });
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "File cover wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: "Format harus JPEG, PNG, atau WebP", code: "INVALID_FILE_TYPE" },
      { status: 422 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: "Ukuran file maksimal 8MB", code: "FILE_TOO_LARGE" },
      { status: 422 }
    );
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const processedBuffer = await sharp(rawBuffer)
    .rotate() // auto-orient sesuai EXIF (foto dari HP kadang rotasi kebalik)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const storageKey = `events/${event.id}/cover/${Date.now()}_${randomUUID()}.jpg`;
  await uploadObject(storageKey, processedBuffer, "image/jpeg");

  const newCoverUrl = publicUrl(storageKey);

  // Hapus cover lama dari R2 kalau ada, supaya tidak menumpuk file yatim.
  if (event.coverImage) {
    const oldKey = keyFromPublicUrl(event.coverImage);
    if (oldKey) await deleteObject(oldKey);
  }

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: { coverImage: newCoverUrl },
  });

  return NextResponse.json({ success: true, data: { coverImage: updated.coverImage } });
}

// DELETE /api/v1/events/{id}/cover — hapus cover, kembali ke gradient default
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session.user.id, deletedAt: null },
  });
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (event.coverImage) {
    const oldKey = keyFromPublicUrl(event.coverImage);
    if (oldKey) await deleteObject(oldKey);
  }

  await prisma.event.update({
    where: { id: event.id },
    data: { coverImage: null },
  });

  return NextResponse.json({ success: true, data: { coverImage: null } });
}

function keyFromPublicUrl(url: string): string | null {
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!base || !url.startsWith(base)) return null;
  return url.slice(base.length + 1);
    }
