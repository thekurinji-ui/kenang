import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinEventSchema } from "@/lib/validation";

// POST /api/v1/e/{eventCode}/join — Volume 7 (Guest API)
export async function POST(
  req: NextRequest,
  { params }: { params: { eventCode: string } }
) {
  const body = await req.json().catch(() => null);
  const parsed = joinEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Data tidak valid", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const event = await prisma.event.findFirst({
    where: { slug: params.eventCode, deletedAt: null },
  });

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (event.status === "ARCHIVED" || event.status === "ENDED") {
    return NextResponse.json(
      { success: false, message: "Event sudah berakhir", code: "EVENT_ENDED" },
      { status: 403 }
    );
  }

  const { nickname, deviceId } = parsed.data;

  // A returning guest (same device) shouldn't create duplicate rows.
  // TODO: promote (eventId, deviceId) to a compound @@unique in schema.prisma
  // and switch this to a single prisma.guest.upsert() call.
  const existing = await prisma.guest.findFirst({
    where: { eventId: event.id, deviceId },
  });

  const guest = existing
    ? await prisma.guest.update({ where: { id: existing.id }, data: { nickname } })
    : await prisma.guest.create({ data: { eventId: event.id, deviceId, nickname } });

  if (guest.isBanned) {
    return NextResponse.json(
      { success: false, message: "Kamu tidak dapat mengakses event ini", code: "GUEST_BANNED" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, data: { guestId: guest.id } });
}
