import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateEventSchema } from "@/lib/validation";

// GET /api/v1/events/{id}
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
    include: { qrCode: true, analytics: true },
  });

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: event });
}

// PATCH /api/v1/events/{id}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const existing = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session.user.id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Data tidak valid", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const { eventDate, ...rest } = parsed.data;
  const event = await prisma.event.update({
    where: { id: params.id },
    data: { ...rest, eventDate: eventDate ? new Date(eventDate) : undefined },
  });

  return NextResponse.json({ success: true, data: event });
}

// DELETE /api/v1/events/{id} — soft delete sesuai Volume 6
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const existing = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session.user.id, deletedAt: null },
  });
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  await prisma.event.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  return NextResponse.json({ success: true, data: { id: params.id } });
}
