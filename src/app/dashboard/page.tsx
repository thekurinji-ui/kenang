import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/dashboard/event-card";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const events = await prisma.event.findMany({
    where: { ownerId: session!.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { analytics: true },
  });

  const totals = await prisma.analytics.aggregate({
    where: { event: { ownerId: session!.user.id, deletedAt: null } },
    _sum: { totalPhotos: true, totalGuests: true },
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">
            Halo, {session!.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="font-body text-sm text-neutral-midnight/60 mt-1">
            Ini ringkasan kenangan yang sudah terkumpul.
          </p>
        </div>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus size={16} /> Buat Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs font-body text-neutral-midnight/50">Total Event</p>
          <p className="font-heading text-2xl font-semibold text-neutral-midnight mt-1">
            {events.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-body text-neutral-midnight/50">Total Foto</p>
          <p className="font-heading text-2xl font-semibold text-neutral-midnight mt-1">
            {totals._sum.totalPhotos ?? 0}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-body text-neutral-midnight/50">Total Tamu</p>
          <p className="font-heading text-2xl font-semibold text-neutral-midnight mt-1">
            {totals._sum.totalGuests ?? 0}
          </p>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-neutral-midnight">Event Terbaru</h2>
          <Link href="/dashboard/events" className="text-sm text-crimson font-body font-medium">
            Lihat semua
          </Link>
        </div>

        {events.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="font-body text-sm text-neutral-midnight/60">
              Belum ada event. Buat event pertamamu untuk mulai mengumpulkan kenangan.
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e) => (
              <EventCard
                key={e.id}
                id={e.id}
                title={e.title}
                location={e.location}
                eventDate={e.eventDate?.toISOString() ?? null}
                status={e.status}
                totalPhotos={e.analytics?.totalPhotos ?? 0}
                totalGuests={e.analytics?.totalGuests ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
