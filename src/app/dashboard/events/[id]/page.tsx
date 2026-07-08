import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QrCard } from "@/components/dashboard/qr-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Users, HardDrive, Images, BarChart3, Settings } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: PageProps) {
  const session = await auth();
  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session!.user.id, deletedAt: null },
    include: { qrCode: true, analytics: true },
  });

  if (!event) notFound();

  const qrImage = event.qrCode
    ? await QRCode.toDataURL(event.qrCode.url, {
        width: 512,
        margin: 2,
        color: { dark: "#111827", light: "#FAFAFA" },
      })
    : null;

  // Formatted for display on the downloadable QR card (Volume 4 branding).
  const eventDateLabel = event.eventDate
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(event.eventDate)
    : null;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-body text-xs uppercase tracking-wide text-crimson font-medium">
            {event.status}
          </p>
          <h1 className="font-heading text-2xl font-semibold text-neutral-midnight mt-1">
            {event.title}
          </h1>
          {event.location && (
            <p className="font-body text-sm text-neutral-midnight/60 mt-1">{event.location}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/events/${event.id}/analytics`}>
            <Button variant="secondary">
              <BarChart3 size={16} /> Analytics
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event.id}/guests`}>
            <Button variant="secondary">
              <Users size={16} /> Tamu
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event.id}/gallery`}>
            <Button variant="secondary">
              <Images size={16} /> Lihat Gallery
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event.id}/settings`}>
            <Button variant="secondary">
              <Settings size={16} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-xs font-body text-neutral-midnight/50 flex items-center gap-1.5">
                <Camera size={14} /> Foto
              </p>
              <p className="font-heading text-xl font-semibold mt-1">
                {event.analytics?.totalPhotos ?? 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-body text-neutral-midnight/50 flex items-center gap-1.5">
                <Users size={14} /> Tamu
              </p>
              <p className="font-heading text-xl font-semibold mt-1">
                {event.analytics?.totalGuests ?? 0}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-body text-neutral-midnight/50 flex items-center gap-1.5">
                <HardDrive size={14} /> Storage
              </p>
              <p className="font-heading text-xl font-semibold mt-1">
                {((event.analytics?.storageUsed ?? 0) / (1024 * 1024)).toFixed(1)} MB
              </p>
            </Card>
          </div>

          <Card className="p-6 space-y-2">
            <h2 className="font-heading font-semibold text-neutral-midnight">Detail Event</h2>
            <dl className="text-sm font-body text-neutral-midnight/70 space-y-1">
              <div className="flex justify-between">
                <dt>Tanggal</dt>
                <dd>
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleDateString("id-ID", { dateStyle: "long" })
                    : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Reveal Mode</dt>
                <dd>{event.revealMode === "INSTANT" ? "Instant" : "Setelah acara selesai"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Batas Jepretan</dt>
                <dd>{event.shotLimit ?? "Unlimited"}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {qrImage && event.qrCode && (
          <QrCard
            eventId={event.id}
            eventTitle={event.title}
            eventDateLabel={eventDateLabel}
            eventLocation={event.location}
            initialImage={qrImage}
            initialUrl={event.qrCode.url}
          />
        )}
      </div>
    </div>
  );
}
