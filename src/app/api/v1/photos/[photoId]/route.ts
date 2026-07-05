import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteObject, getObjectSize } from "@/lib/r2";

async function ownedPhoto(photoId: string, userId: string) {
  return prisma.photo.findFirst({
    where: { id: photoId, event: { ownerId: userId, deletedAt: null } },
    include: { event: true },
  });
}

// PATCH /api/v1/photos/{photoId} — toggle favorite
export async function PATCH(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const photo = await ownedPhoto(params.photoId, session.user.id);
  if (!photo) {
    return NextResponse.json(
      { success: false, message: "Foto tidak ditemukan", code: "PHOTO_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const data: { isFavorite?: boolean; albumId?: string | null } = {};

  if (typeof body.isFavorite === "boolean") {
    data.isFavorite = body.isFavorite;
  }

  if ("albumId" in body) {
    if (body.albumId !== null) {
      const album = await prisma.album.findFirst({
        where: { id: body.albumId, eventId: photo.eventId },
      });
      if (!album) {
        return NextResponse.json(
          { success: false, message: "Album tidak ditemukan", code: "ALBUM_NOT_FOUND" },
          { status: 404 }
        );
      }
    }
    data.albumId = body.albumId;
  }

  if (Object.keys(data).length === 0) {
    data.isFavorite = !photo.isFavorite;
  }

  const updated = await prisma.photo.update({
    where: { id: photo.id },
    data,
  });

  return NextResponse.json({ success: true, data: updated });
}

// DELETE /api/v1/photos/{photoId} — Host dapat menghapus foto (Business Rules, Volume 2)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const photo = await ownedPhoto(params.photoId, session.user.id);
  if (!photo) {
    return NextResponse.json(
      { success: false, message: "Foto tidak ditemukan", code: "PHOTO_NOT_FOUND" },
      { status: 404 }
    );
  }

  const fileSize = await getObjectSize(photo.storageKey);

  await prisma.photo.delete({ where: { id: photo.id } });

  await prisma.analytics.updateMany({
    where: { eventId: photo.eventId },
    data: {
      totalPhotos: { decrement: 1 },
      ...(fileSize > 0 ? { storageUsed: { decrement: fileSize } } : {}),
    },
  });

  // Best-effort R2 cleanup — no-op failure is fine since the DB record
  // (source of truth) is already gone.
  await deleteObject(photo.storageKey);
  if (photo.thumbnailKey) {
    await deleteObject(photo.thumbnailKey);
  }

  return NextResponse.json({ success: true, data: { id: photo.id } });
}
