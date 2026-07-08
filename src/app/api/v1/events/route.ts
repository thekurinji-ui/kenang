import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEventSchema } from "@/lib/validation";
import { generateUniqueSlug } from "@/lib/slug";
import { PLAN_LIMITS, computeActiveUntil, getEffectivePlan, isRollFilmOptionAllowed } from "@/lib/plans";

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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      subscription: { select: { plan: true, status: true, expiresAt: true } },
    },
  });

  const isAdmin = user?.role === "ADMIN";
  const plan = getEffectivePlan(user?.subscription);
  const planConfig = PLAN_LIMITS[plan];

  // Enforcement (Blueprint v2.1): 1 Event per plan (Kincai/Kurinji/Gunung
  // Tujuh) — admin dikecualikan dari batas ini untuk keperluan operasional.
  if (!isAdmin && planConfig.limits.maxEvents !== null) {
    const eventCount = await prisma.event.count({
      where: { ownerId: session.user.id, deletedAt: null },
    });
    if (eventCount >= planConfig.limits.maxEvents) {
      return NextResponse.json(
        {
          success: false,
          message: `Paket ${planConfig.name} kamu hanya bisa punya ${planConfig.limits.maxEvents} event aktif. Upgrade paket untuk membuat event baru.`,
          code: "EVENT_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  // Business rule (Volume 2): satu QR hanya untuk satu event — dibuat
  // sekaligus di sini supaya host langsung punya link untuk dibagikan.
  const { title, description, eventDate, location, revealMode, category, shotLimit } = parsed.data;

  // Roll Film fix (Blueprint v2.1): jumlah jepretan yang boleh dipilih host
  // terbatas sesuai plan-nya (Kincai cuma 5, Kurinji 5/12/24/39, dst).
  // create-event-form.tsx sekarang cuma menawarkan opsi yang sesuai plan,
  // tapi tetap divalidasi lagi di server untuk jaga-jaga request langsung
  // ke API. Admin dikecualikan (konsisten dengan bypass maxEvents di atas).
  if (!isAdmin && shotLimit !== undefined && !isRollFilmOptionAllowed(plan, shotLimit ?? null)) {
    return NextResponse.json(
      {
        success: false,
        message: `Paket ${planConfig.name} kamu tidak punya opsi ${
          shotLimit ?? "Unlimited"
        } jepretan. Pilih salah satu opsi Roll Film yang tersedia untuk paketmu.`,
        code: "ROLL_FILM_NOT_ALLOWED",
      },
      { status: 422 }
    );
  }

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
      category,
      shotLimit: shotLimit ?? null,
      status: "DRAFT",
      // Snapshot plan + masa aktif event (lihat catatan di schema.prisma).
      // Admin dapat activeUntil = null (tanpa batas) untuk event mereka
      // sendiri, konsisten dengan bypass batasan paket lain.
      plan,
      activeUntil: isAdmin ? null : computeActiveUntil(plan, new Date()),
      qrCode: {
        create: { code: slug, url: `${appUrl}/e/${slug}` },
      },
      analytics: { create: {} },
    },
    include: { qrCode: true },
  });

  return NextResponse.json({ success: true, data: event }, { status: 201 });
}
