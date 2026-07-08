import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Button } from "@/components/ui/button";
import { hasAIAccess } from "@/lib/plans";

interface PageProps {
  params: { id: string };
}

export default async function EventGalleryPage({ params }: PageProps) {
  const session = await auth();
  const event = await prisma.event.findFirst({
    where: { id: params.id, ownerId: session!.user.id, deletedAt: null },
  });
  if (!event) notFound();

  const [photos, albums] = await Promise.all([
    prisma.photo.findMany({
      where: { eventId: event.id },
      orderBy: { uploadedAt: "desc" },
      include: { guest: { select: { nickname: true } } },
    }),
    prisma.album.findMany({
      where: { eventId: event.id },
      include: { _count: { select: { photos: true } } },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-midnight/60 font-body mb-3"
          >
            <ArrowLeft size={14} /> Kembali ke {event.title}
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Gallery</h1>
          <p className="font-body text-sm text-neutral-midnight/60 mt-1">
            {photos.length} foto terkumpul dari tamu.
          </p>
        </div>
        {photos.length > 0 && (
          <a href={`/api/v1/events/${event.id}/export`} download>
            <Button variant="secondary">
              <Download size={16} /> Unduh Semua (ZIP)
            </Button>
          </a>
        )}
      </div>

      <GalleryGrid
        eventId={event.id}
        initialPhotos={photos.map((p) => ({
          ...p,
          uploadedAt: p.uploadedAt.toISOString(),
          aiAnalyzedAt: p.aiAnalyzedAt ? p.aiAnalyzedAt.toISOString() : null,
        }))}
        initialAlbums={albums}
        hasAIAccess={hasAIAccess(event.plan)}
      />
    </div>
  );
}
