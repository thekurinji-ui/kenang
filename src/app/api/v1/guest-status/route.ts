import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/guest-status?eventCode=xxx&deviceId=yyy
//
// Dipanggil Kenang Camera setiap dibuka (termasuk kalau guest sempat keluar
// dari web lalu scan QR-nya lagi) supaya sisa jatah foto per-device yang
// ditampilkan di layar SELALU sinkron dengan yang sebenarnya sudah tersimpan
// di server — bukan cuma hitungan lokal di memori browser yang reset ke 0
// tiap kali halaman dimuat ulang. Enforcement asli tetap di
// src/app/api/v1/uploads/route.ts; endpoint ini murni buat tampilan.
export async function GET(req: NextRequest) {
  const eventCode = req.nextUrl.searchParams.get("eventCode");
  const deviceId = req.nextUrl.searchParams.get("deviceId");

  if (!eventCode || !deviceId) {
    return NextResponse.json(
      { success: false, message: "eventCode & deviceId wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const event = await prisma.event.findFirst({
    where: { slug: eventCode, deletedAt: null },
    select: { id: true, shotLimit: true },
  });

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  // Sama persis dengan query enforcement di uploads/route.ts — total foto
  // guest ini (device ini) yang sudah tersimpan di event tersebut.
  const shotsTaken = await prisma.photo.count({
    where: { eventId: event.id, guest: { deviceId } },
  });

  const remaining =
    event.shotLimit === null ? null : Math.max(event.shotLimit - shotsTaken, 0);

  return NextResponse.json({
    success: true,
    data: { shotsTaken, shotLimit: event.shotLimit, remaining },
  });
}
