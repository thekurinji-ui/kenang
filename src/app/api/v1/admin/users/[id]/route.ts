import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// PATCH /api/v1/admin/users/{id} — ubah role user (promote/demote Super Admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  if (params.id === guard.session.user.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Tidak bisa mengubah role akun sendiri",
        code: "CANNOT_MODIFY_SELF",
      },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const role = body?.role === "ADMIN" ? "ADMIN" : "OWNER";

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, data: user });
}

// DELETE /api/v1/admin/users/{id} — hapus akun user beserta seluruh datanya
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  if (params.id === guard.session.user.id) {
    return NextResponse.json(
      {
        success: false,
        message: "Tidak bisa menghapus akun sendiri",
        code: "CANNOT_DELETE_SELF",
      },
      { status: 400 }
    );
  }

  // Hapus event-event milik user dulu (beserta relasi turunannya) baru user-nya,
  // supaya tidak kena foreign key constraint dari Prisma.
  const eventIds = (
    await prisma.event.findMany({ where: { ownerId: params.id }, select: { id: true } })
  ).map((e) => e.id);

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { eventId: { in: eventIds } } }),
    prisma.guest.deleteMany({ where: { eventId: { in: eventIds } } }),
    prisma.album.deleteMany({ where: { eventId: { in: eventIds } } }),
    prisma.qRCode.deleteMany({ where: { eventId: { in: eventIds } } }),
    prisma.analytics.deleteMany({ where: { eventId: { in: eventIds } } }),
    prisma.event.deleteMany({ where: { ownerId: params.id } }),
    prisma.paymentOrder.deleteMany({ where: { userId: params.id } }),
    prisma.subscription.deleteMany({ where: { userId: params.id } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: params.id } }),
    prisma.user.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ success: true, message: "User berhasil dihapus" });
}
