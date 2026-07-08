import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, hasAIAccess, PLAN_LIMITS } from "@/lib/plans";
import { generateEventStory } from "@/lib/ai-pipeline";

// AI Features v3.0 — Feature 2: AI Story
// Dipanggil manual oleh host dari dashboard (butuh foto-foto terbaik +
// metadata event, jadi tidak cocok dijalankan otomatis per-upload seperti
// Best Shot/Smart Gallery). Hasilnya disimpan di Event.aiStory supaya tidak
// perlu panggil OpenAI berulang kali tiap halaman dibuka.

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Silakan login", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const eventId = body?.eventId;
  if (typeof eventId !== "string") {
    return NextResponse.json(
      { success: false, message: "eventId wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.ownerId !== session.user.id) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscription: { select: { plan: true, status: true, expiresAt: true } } },
  });
  const plan = getEffectivePlan(user?.subscription);

  if (!hasAIAccess(plan)) {
    return NextResponse.json(
      {
        success: false,
        message: `Fitur AI Story tersedia mulai paket ${PLAN_LIMITS.GUNUNG_TUJUH.name} ke atas.`,
        code: "PLAN_RESTRICTED",
      },
      { status: 403 }
    );
  }

  try {
    const story = await generateEventStory(eventId);
    return NextResponse.json({ success: true, data: { story } });
  } catch (err) {
    console.error("[api/ai/story] Gagal generate story:", err);
    return NextResponse.json(
      { success: false, message: "Gagal membuat AI Story, coba lagi.", code: "AI_ERROR" },
      { status: 502 }
    );
  }
}

// GET /api/ai/story?eventId=xxx — ambil story yang sudah pernah digenerate
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json(
      { success: false, message: "eventId wajib diisi", code: "VALIDATION_ERROR" },
      { status: 422 }
    );
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { aiStory: true, aiStoryGeneratedAt: true },
  });

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event tidak ditemukan", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: event });
}
