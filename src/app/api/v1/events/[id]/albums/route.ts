import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAlbumSchema } from "@/lib/validation";

async function ownedEvent(eventId: string, userId: string) {
  return prisma.event.findFirst({
    where: { id: eventId, ownerId: userId, deletedAt: null },
  });
}

// GET /api/v1/events/{id}/albums — list albums with photo counts
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const event = await ownedEvent(params.id, session.user.id);
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const albums = await prisma.album.findMany({
    where: { eventId: event.id },
    include: { _count: { select: { photos: true } } },
    orderBy: { title: "asc" },
  });

  return NextResponse.json({ success: true, data: albums });
}

// POST /api/v1/events/{id}/albums — create album
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const event = await ownedEvent(params.id, session.user.id);
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createAlbumSchema.safeParse(body);
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

  const album = await prisma.album.create({
    data: { eventId: event.id, ...parsed.data },
  });

  return NextResponse.json({ success: true, data: { ...album, _count: { photos: 0 } } });
}
