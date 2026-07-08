import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { adminUpdateSubscriptionSchema } from "@/lib/validation";

// PATCH /api/v1/admin/users/{id}/subscription — set plan/status/masa aktif
// subscription user manapun secara manual. Dipakai khusus untuk plan
// GUNUNG_KERINCI ("Custom / Hubungi Sales") yang memang tidak bisa dibeli
// lewat Midtrans (lihat CHECKOUT_PLANS di lib/plans.ts) — admin yang
// mengaktifkannya setelah proses closing manual di luar sistem. Boleh
// dipakai admin untuk akun sendiri (beda dengan PATCH role/DELETE user yang
// sengaja diblok untuk diri sendiri), karena tidak ada resiko admin
// mengunci diri sendiri keluar dari akses.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, message: guard.message, code: guard.code },
      { status: guard.status }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = adminUpdateSubscriptionSchema.safeParse(body);
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

  const { plan, status, expiresAt: expiresAtRaw } = parsed.data;

  let expiresAt: Date | null = null;
  if (expiresAtRaw) {
    const parsedDate = new Date(expiresAtRaw);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal masa aktif tidak valid", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }
    expiresAt = parsedDate;
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!targetUser) {
    return NextResponse.json(
      { success: false, message: "User tidak ditemukan", code: "USER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId: params.id },
    create: { userId: params.id, plan, status, expiresAt },
    update: { plan, status, expiresAt },
    select: { plan: true, status: true, expiresAt: true },
  });

  return NextResponse.json({ success: true, data: subscription });
}
