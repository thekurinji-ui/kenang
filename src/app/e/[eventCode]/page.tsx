import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KenangCamera } from "@/components/camera/kenang-camera";
import { ExpiredEventScreen } from "@/components/camera/expired-event-screen";
import type { PublicEventInfo } from "@/types";

interface PageProps {
  params: { eventCode: string };
}

// Guest flow (Volume 5 & 3): Scan QR → this page opens directly → Camera
// Permission → Choose Film → Capture → Upload. No login required.
export default async function GuestCameraPage({ params }: PageProps) {
  const event = await prisma.event.findFirst({
    where: { slug: params.eventCode, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      eventDate: true,
      location: true,
      status: true,
      revealMode: true,
      shotLimit: true,
      activeUntil: true,
    },
  });

  if (!event || event.status === "ARCHIVED") {
    notFound();
  }

  // Full lock (Blueprint v2.1 — Masa Aktif): sekali lewat activeUntil, guest
  // tidak bisa membuka Kenang Camera sama sekali lagi untuk event ini.
  if (event.activeUntil && event.activeUntil.getTime() < Date.now()) {
    return (
      <main className="h-dvh w-dvw">
        <ExpiredEventScreen eventTitle={event.title} />
      </main>
    );
  }

  const publicEvent: PublicEventInfo = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    coverImage: event.coverImage,
    eventDate: event.eventDate?.toISOString() ?? null,
    location: event.location,
    status: event.status,
    revealMode: event.revealMode,
    shotLimit: event.shotLimit,
  };

  return (
    <main className="h-dvh w-dvw">
      <KenangCamera event={publicEvent} />
    </main>
  );
}
