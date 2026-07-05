import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAlbumSchema } from "@/lib/validation";

async function ownedAlbum(albumId: string, userId: string) {
  return prisma.album.findFirst({
    where: { id: albumId, event: { ownerId: userId, deletedAt: null } },
  });
}

// PATCH /api/v1/albums/{albumId} — rename/update album
export async function PATCH(
  req: NextRequest,
  { params }: { params: { albumId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const album = await ownedAlbum(params.albumId, session.user.id);
  if (!album) {
    return NextResponse.json(
      { success: false, message: "Album tidak ditemukan", code: "ALBUM_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateAlbumSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Data tidak valid",
        code: "VALIDATION_ERROR",
      },
      { status: 422 }
    );
  }

  const updated = await prisma.album.update({
    where: { id: album.id },
    data: parsed.data,
  });

  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/v1/albums/{albumId} — delete album (photos remain, just unassigned)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { albumId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const album = await ownedAlbum(params.albumId, session.user.id);
  if (!album) {
    return NextResponse.json(
      { success: false, message: "Album tidak ditemukan", code: "ALBUM_NOT_FOUND" },
      { status: 404 }
    );
  }

  await prisma.photo.updateMany({
    where: { albumId: album.id },
    data: { albumId: null },
  });
  await prisma.album.delete({ where: { id: album.id } });

  return NextResponse.json({ success: true, data: { id: album.id } });
}
