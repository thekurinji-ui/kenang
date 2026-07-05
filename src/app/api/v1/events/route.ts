import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEventSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";

// GET /api/v1/events — Volume 7 (Event API)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const events = await prisma.event.findMany({
    where: { ownerId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { analytics: true, qrCode: true },
  });

  return NextResponse.json({ success: true, data: events });
}

// POST /api/v1/events — Create Event
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createEventSchema.safeParse(body);
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

  // Business rule (Volume 2): satu QR hanya untuk satu event — dibuat
  // sekaligus di sini supaya host langsung punya link untuk dibagikan.
  const { title, description, eventDate, location, revealMode, shotLimit } = parsed.data;
  const slug = await generateUniqueSlug(title);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const event = await prisma.event.create({
    data: {
      ownerId: session.user.id,
      title,
      slug,
      description,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      location,
      revealMode,
      shotLimit: shotLimit ?? null,
      status: "DRAFT",
      qrCode: {
        create: { code: slug, url: `${appUrl}/e/${slug}` },
      },
      analytics: { create: {} },
    },
    include: { qrCode: true },
  });

  return NextResponse.json({ success: true, data: event }, { status: 201 });
}
