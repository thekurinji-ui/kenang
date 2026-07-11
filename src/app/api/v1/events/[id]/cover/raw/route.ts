import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getObjectBuffer } from "@/lib/r2";

// GET /api/v1/events/{id}/cover/raw
//
// Streams the event's cover photo through OUR OWN origin instead of R2's
// public URL. Needed because the A4 QR poster draws the cover photo onto a
// <canvas> (see qr-card.ts) — canvas.toBlob() throws/taints if the image
// came from a cross-origin URL that doesn't send CORS headers, which R2's
// public bucket doesn't by default. Same-origin sidesteps that entirely.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
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
  if (!event?.coverImage) {
    return NextResponse.json(
      { success: false, message: "Cover tidak ditemukan", code: "COVER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  const key = event.coverImage.startsWith(base) ? event.coverImage.slice(base.length + 1) : null;
  if (!key) {
    return NextResponse.json(
      { success: false, message: "Cover tidak valid", code: "INVALID_COVER" },
      { status: 404 }
    );
  }

  const buffer = await getObjectBuffer(key);
  if (!buffer) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat cover", code: "COVER_LOAD_FAILED" },
      { status: 500 }
    );
  }

  // Upload pipeline (src/app/api/v1/events/[id]/cover/route.ts) always
  // re-encodes covers to JPEG via sharp, so this is safe to hardcode.
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=300",
    },
  });
}
