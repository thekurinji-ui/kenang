import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsView } from "@/components/dashboard/analytics-view";

interface PageProps {
  params: { id: string };
}

export default async function EventAnalyticsPage({ params }: PageProps) {
  const session = await auth();
  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session!.user.id, deletedAt: null },
    include: { analytics: true },
  });
  if (!event) notFound();

  const photos = await prisma.photo.findMany({
    where: { eventId: event.id },
    select: { uploadedAt: true, filmType: true },
  });

  const timelineMap = new Map<string, number>();
  const filmMap = new Map<string, number>();

  for (const photo of photos) {
    const day = photo.uploadedAt.toISOString().slice(0, 10);
    timelineMap.set(day, (timelineMap.get(day) ?? 0) + 1);
    filmMap.set(photo.filmType, (filmMap.get(photo.filmType) ?? 0) + 1);
  }

  const timeline = Array.from(timelineMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const filmBreakdown = Array.from(filmMap.entries())
    .map(([filmType, count]) => ({ filmType, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-midnight/60 font-body mb-3"
        >
          <ArrowLeft size={14} /> Kembali ke {event.title}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Analytics</h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Ringkasan performa event ini.
        </p>
      </div>

      <AnalyticsView
        data={{
          totalPhotos: photos.length,
          totalGuests: event.analytics?.totalGuests ?? 0,
          storageUsed: event.analytics?.storageUsed ?? 0,
          timeline,
          filmBreakdown,
        }}
      />
    </div>
  );
}
