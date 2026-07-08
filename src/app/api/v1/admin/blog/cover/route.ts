import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin";
import { uploadObject, publicUrl } from "@/lib/r2";

// POST /api/v1/admin/blog/cover — upload cover image artikel blog.
// Berdiri sendiri (tidak butuh postId) supaya admin bisa upload cover
// SEBELUM artikel disimpan (dipakai di form tulis/edit artikel baru).
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_WIDTH = 1600;

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
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
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const storageKey = `blog/covers/${Date.now()}_${randomUUID()}.jpg`;
  await uploadObject(storageKey, processedBuffer, "image/jpeg");

  return NextResponse.json({ success: true, data: { coverImage: publicUrl(storageKey) } });
}
