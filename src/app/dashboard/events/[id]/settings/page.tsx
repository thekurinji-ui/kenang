import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditEventForm } from "@/components/dashboard/edit-event-form";
import { EventCoverUpload } from "@/components/dashboard/event-cover-upload";

interface PageProps {
  params: { id: string };
}

export default async function EventSettingsPage({ params }: PageProps) {
  const session = await auth();
  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session!.user.id, deletedAt: null },
  });
  if (!event) notFound();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-midnight/60 font-body mb-3"
        >
          <ArrowLeft size={14} /> Kembali ke {event.title}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">
          Pengaturan Event
        </h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Ubah detail, status, dan batas jepretan event ini.
        </p>
      </div>

      <EventCoverUpload eventId={event.id} initialCoverImage={event.coverImage} />

      <EditEventForm
        eventId={event.id}
        plan={event.plan}
        defaultValues={{
          title: event.title,
          location: event.location,
          eventDate: event.eventDate ? event.eventDate.toISOString().slice(0, 10) : null,
          revealMode: event.revealMode,
          shotLimit: event.shotLimit,
          status: event.status,
        }}
      />
    </div>
  );
}
