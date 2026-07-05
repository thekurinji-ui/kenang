import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/events/{id}/analytics — timeline upload, film populer, storage usage
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
    include: { analytics: true },
  });
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const photos = await prisma.photo.findMany({
    where: { eventId: event.id },
    select: { uploadedAt: true, filmType: true },
  });

  const timelineMap = new Map<string, number>();
  const filmMap = new Map<string, number>();

  for (const photo of photos) {
    const day = photo.uploadedAt.toISOString().slice(0, 10);
    timelineMap.set(day, (timelineMap.get(day) ?? 0) + 1);
    filmMap.set(photo.filmType, (filmMap.get(photo.filmType) ?? 0) + 1);
  }

  const timeline = Array.from(timelineMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const filmBreakdown = Array.from(filmMap.entries())
    .map(([filmType, count]) => ({ filmType, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    success: true,
    data: {
      totalPhotos: photos.length,
      totalGuests: event.analytics?.totalGuests ?? 0,
      storageUsed: event.analytics?.storageUsed ?? 0,
      timeline,
      filmBreakdown,
    },
  });
}
