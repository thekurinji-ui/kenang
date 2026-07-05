import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/events/{id}/gallery — Volume 7 (Gallery API)
// Query params: ?filter=favorite | ?film=<filmType>
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const film = searchParams.get("film");

  const photos = await prisma.photo.findMany({
    where: {
      eventId: event.id,
      ...(filter === "favorite" ? { isFavorite: true } : {}),
      ...(film ? { filmType: film } : {}),
    },
    orderBy: { uploadedAt: "desc" },
    include: { guest: { select: { nickname: true } } },
  });

  return NextResponse.json({ success: true, data: photos });
}
