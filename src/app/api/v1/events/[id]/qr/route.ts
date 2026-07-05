import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ownedEvent(id: string, userId: string) {
  return prisma.event.findFirst({
    where: { id, ownerId: userId, deletedAt: null },
    include: { qrCode: true },
  });
}

// GET /api/v1/events/{id}/qr — returns the QR as a PNG data URL for display/download
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const event = await ownedEvent(params.id, session.user.id);
  if (!event?.qrCode) {
    return NextResponse.json(
      { success: false, message: "QR tidak ditemukan", code: "QR_NOT_FOUND" },
      { status: 404 }
    );
  }

  const dataUrl = await QRCode.toDataURL(event.qrCode.url, {
    width: 512,
    margin: 2,
    color: { dark: "#111827", light: "#FAFAFA" },
  });

  return NextResponse.json({
    success: true,
    data: { url: event.qrCode.url, code: event.qrCode.code, image: dataUrl },
  });
}

// POST /api/v1/events/{id}/qr — regenerate the QR code (new random code, same event)
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
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

  // The QR always points at the event's slug-based URL; "regenerate" here
  // means re-issuing the QR record (e.g. after a slug change), not rotating
  // the guest-facing link — Volume 2 states one QR per event.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/e/${event.slug}`;

  const qrCode = await prisma.qRCode.upsert({
    where: { eventId: event.id },
    update: { url },
    create: { eventId: event.id, code: event.slug, url },
  });

  const dataUrl = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: { dark: "#111827", light: "#FAFAFA" },
  });

  return NextResponse.json({ success: true, data: { ...qrCode, image: dataUrl } });
}
