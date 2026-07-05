import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ownedGuest(guestId: string, userId: string) {
  return prisma.guest.findFirst({
    where: { id: guestId, event: { ownerId: userId, deletedAt: null } },
  });
}

// PATCH /api/v1/guests/{guestId} — toggle ban status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { guestId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const guest = await ownedGuest(params.guestId, session.user.id);
  if (!guest) {
    return NextResponse.json(
      { success: false, message: "Tamu tidak ditemukan", code: "GUEST_NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const isBanned = typeof body.isBanned === "boolean" ? body.isBanned : !guest.isBanned;

  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: { isBanned },
  });

  return NextResponse.json({ success: true, data: updated });
}
