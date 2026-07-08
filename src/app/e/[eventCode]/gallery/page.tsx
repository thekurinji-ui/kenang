import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { photoUrl } from "@/lib/utils";

interface PageProps {
  params: { eventCode: string };
}

// Galeri publik untuk tamu — TIDAK butuh login, cukup buka link event-nya.
// Aksesnya mengikuti `revealMode` (Blueprint v2.1):
// - INSTANT: siapa saja bisa lihat kapan pun.
// - AFTER_EVENT_ENDS: baru bisa dilihat setelah host menandai event ENDED
//   (atau ARCHIVED). Sebelum itu, tampilkan pesan "belum bisa dilihat"
//   alih-alih galeri kosong yang membingungkan.
export default async function GuestGalleryPage({ params }: PageProps) {
  const event = await prisma.event.findFirst({
    where: { slug: params.eventCode, deletedAt: null },
    select: {
      id: true,
      title: true,
      status: true,
      revealMode: true,
    },
  });

  if (!event || event.status === "ARCHIVED") notFound();

  const canView =
    event.revealMode === "INSTANT" || event.status === "ENDED";

  if (!canView) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-5 bg-neutral-midnight text-neutral-white px-8 text-center">
        <Image
          src="/logo.png"
          alt="Kenang Kurinji"
          width={180}
          height={91}
          className="h-10 w-auto brightness-0 invert opacity-90"
        />
        <div className="space-y-2">
          <h1 className="font-heading text-xl font-semibold">
            Galeri Belum Bisa Dilihat
          </h1>
          <p className="font-body text-sm text-neutral-slate max-w-xs">
            Host memilih agar galeri <span className="italic">{event.title}</span>{" "}
            baru terbuka untuk semua tamu setelah acaranya selesai. Sabar ya,
            momennya sudah tersimpan aman.
          </p>
        </div>
        <Link
          href={`/e/${params.eventCode}`}
          className="mt-2 font-body text-sm text-crimson underline underline-offset-4"
        >
          Kembali motret
        </Link>
      </main>
    );
  }

  const photos = await prisma.photo.findMany({
    where: { eventId: event.id },
    orderBy: { uploadedAt: "desc" },
    select: { id: true, storageKey: true, thumbnailKey: true, filmType: true },
  });

  return (
    <main className="min-h-dvh bg-neutral-midnight text-neutral-white">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-white/10 bg-neutral-midnight/90 px-5 py-4 backdrop-blur">
        <div>
          <h1 className="font-heading text-lg font-semibold leading-tight">
            {event.title}
          </h1>
          <p className="font-body text-xs text-neutral-slate/70">
            {photos.length} kenangan terkumpul dari semua tamu
          </p>
        </div>
        <Link
          href={`/e/${params.eventCode}`}
          className="shrink-0 font-body text-xs text-neutral-white/70 underline underline-offset-4"
        >
          Motret lagi
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-8 py-24 text-center">
          <p className="font-body text-sm text-neutral-slate/70">
            Belum ada foto yang masuk. Jadilah yang pertama mengabadikan momen
            di acara ini!
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-1.5 p-1.5 sm:columns-3 md:columns-4">
          {photos.map((photo) => (
            <a
              key={photo.id}
              href={photoUrl(photo.storageKey)}
              target="_blank"
              rel="noreferrer"
              className="mb-1.5 block break-inside-avoid overflow-hidden rounded-sm bg-neutral-white/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- jumlah
                  foto & aspect ratio bervariasi bebas, next/image butuh
                  width/height pasti; <img> lebih simpel untuk grid masonry ini */}
              <img
                src={photoUrl(photo.thumbnailKey ?? photo.storageKey)}
                alt=""
                loading="lazy"
                className="h-auto w-full"
              />
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
