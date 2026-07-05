import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/dashboard/event-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function EventsPage() {
  const session = await auth();
  const events = await prisma.event.findMany({
    where: { ownerId: session!.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { analytics: true },
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">My Events</h1>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus size={16} /> Buat Event
          </Button>
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
  );
}
