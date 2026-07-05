import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/events/{id}/guests — daftar tamu + jumlah foto per tamu
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
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { joinedAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  return NextResponse.json({ success: true, data: guests });
}
