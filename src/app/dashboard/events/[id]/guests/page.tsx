import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GuestsList } from "@/components/dashboard/guests-list";

interface PageProps {
  params: { id: string };
}

export default async function EventGuestsPage({ params }: PageProps) {
  const session = await auth();
  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session!.user.id, deletedAt: null },
  });
  if (!event) notFound();

  const guests = await prisma.guest.findMany({
    where: { eventId: event.id },
    orderBy: { joinedAt: "desc" },
    include: { _count: { select: { photos: true } } },
  });

  const activeCount = guests.filter((g) => !g.isBanned).length;
  const bannedCount = guests.length - activeCount;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-midnight/60 font-body mb-3"
        >
          <ArrowLeft size={14} /> Kembali ke {event.title}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Tamu</h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          {activeCount} tamu aktif{bannedCount > 0 ? ` · ${bannedCount} dibanned` : ""}
        </p>
      </div>

      <GuestsList
        initialGuests={guests.map((g) => ({
          ...g,
          joinedAt: g.joinedAt.toISOString(),
        }))}
      />
    </div>
  );
}
