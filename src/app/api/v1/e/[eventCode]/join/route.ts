import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { joinEventSchema } from "@/lib/validation";
import { PLAN_LIMITS } from "@/lib/plans";

// Sentinel error dilempar dari dalam transaction saat kuota guest sudah
// penuh, supaya bisa dibedakan dari error database lain di catch block.
class GuestLimitReachedError extends Error {}

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

  // Full lock (Blueprint v2.1 — Masa Aktif): sekali lewat activeUntil, guest
  // sama sekali tidak bisa join lagi, terlepas dari status event-nya.
  if (event.activeUntil && event.activeUntil.getTime() < Date.now()) {
    return NextResponse.json(
      {
        success: false,
        message: "Masa aktif event ini sudah berakhir. Hubungi host untuk informasi lebih lanjut.",
        code: "EVENT_EXPIRED",
      },
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

  // Enforcement (Blueprint v2.1): maxGuests hanya berlaku untuk tamu BARU —
  // tamu yang sudah pernah join (device sama) tetap boleh masuk lagi walau
  // kuota sudah penuh, supaya guest yang sudah difoto tidak mendadak terkunci.
  //
  // PENTING: cek kuota dan insert tamu digabung jadi SATU transaction, dan
  // reservasi kuota dilakukan lewat updateMany({ guestCount: { lt: maxGuests } })
  // — bukan count() lalu create() terpisah. Kalau dipisah, banyak guest yang
  // join bersamaan (mis. semua tamu scan QR di detik yang sama) bisa
  // sama-sama lolos pengecekan sebelum salah satu selesai insert, sehingga
  // guestCount bisa kebobolan melewati maxGuests. UPDATE ... WHERE di
  // Postgres itu atomic per baris, jadi cara ini aman dari race condition
  // walau ada ratusan request bersamaan.
  let guest;
  if (existing) {
    guest = await prisma.guest.update({ where: { id: existing.id }, data: { nickname } });
  } else {
    const maxGuests = PLAN_LIMITS[event.plan].limits.maxGuests;

    try {
      guest = await prisma.$transaction(async (tx) => {
        if (maxGuests !== null) {
          const reserved = await tx.event.updateMany({
            where: { id: event.id, guestCount: { lt: maxGuests } },
            data: { guestCount: { increment: 1 } },
          });
          if (reserved.count === 0) {
            throw new GuestLimitReachedError();
          }
        } else {
          await tx.event.update({
            where: { id: event.id },
            data: { guestCount: { increment: 1 } },
          });
        }

        return tx.guest.create({ data: { eventId: event.id, deviceId, nickname } });
      });
    } catch (err) {
      if (err instanceof GuestLimitReachedError) {
        return NextResponse.json(
          {
            success: false,
            message: "Jumlah tamu untuk event ini sudah mencapai batas maksimum.",
            code: "GUEST_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
      throw err;
    }
  }

  if (guest.isBanned) {
    return NextResponse.json(
      { success: false, message: "Kamu tidak dapat mengakses event ini", code: "GUEST_BANNED" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, data: { guestId: guest.id } });
}
