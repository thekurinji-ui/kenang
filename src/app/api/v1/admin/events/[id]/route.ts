import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { updateEventSchema } from "@/lib/validation";

// PATCH /api/v1/admin/events/{id} — admin edit detail/status event client
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const existing = await prisma.event.findUnique({ where: { id: params.id } });
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
      {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Data tidak valid",
        code: "VALIDATION_ERROR",
      },
      { status: 422 }
    );
  }

  const { eventDate, ...rest } = parsed.data;

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(eventDate !== undefined ? { eventDate: eventDate ? new Date(eventDate) : null } : {}),
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ success: true, data: event });
}

// DELETE /api/v1/admin/events/{id} — soft delete event (sama seperti host hapus event sendiri)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "EVENT_NOT_FOUND" },
      { status: 404 }
    );
  }

  await prisma.event.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true, message: "Event berhasil dihapus" });
}
