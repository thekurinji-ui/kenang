"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface EndOfRollProps {
  shotsTaken: number;
  eventSlug: string;
  revealMode: "INSTANT" | "AFTER_EVENT_ENDS";
  eventStatus: "DRAFT" | "LIVE" | "ENDED" | "ARCHIVED";
}

const REDIRECT_DELAY_MS = 2200;

/**
 * Signature Experience (Volume 5): saat jatah foto habis, tampilkan animasi
 * bunga Neelakurinji disertai pesan bahwa setiap momen yang telah diabadikan
 * akan selalu menjadi kenangan — lalu arahkan tamu ke galeri (kalau sudah
 * boleh dilihat sesuai `revealMode` event, lihat Blueprint v2.1).
 */
export function EndOfRoll({ shotsTaken, eventSlug, revealMode, eventStatus }: EndOfRollProps) {
  const router = useRouter();
  const canViewGallery = revealMode === "INSTANT" || eventStatus === "ENDED";

  useEffect(() => {
    if (!canViewGallery) return;
    const t = setTimeout(() => router.push(`/e/${eventSlug}/gallery`), REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [canViewGallery, eventSlug, router]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-neutral-midnight text-neutral-white px-8 text-center">
      <Image
        src="/logo.png"
        alt="Kenang Kurinji"
        width={220}
        height={112}
        className="animate-bloom h-16 w-auto brightness-0 invert"
      />
      <div className="space-y-2">
        <h1 className="font-heading text-xl font-semibold">Filmmu Sudah Habis</h1>
        <p className="font-body text-sm text-neutral-slate max-w-xs">
          Kamu telah mengabadikan {shotsTaken} momen di acara ini. Setiap
          Neelakurinji hanya mekar sekali dalam siklusnya — begitu juga momen
          yang baru saja kamu jepret.
        </p>
      </div>

      {canViewGallery ? (
        <button
          type="button"
          onClick={() => router.push(`/e/${eventSlug}/gallery`)}
          className="font-body text-sm text-neutral-white underline underline-offset-4"
        >
          Lihat Galeri Sekarang →
        </button>
      ) : (
        <p className="font-body text-xs text-neutral-slate/70 max-w-xs">
          Galeri akan terbuka untuk semua tamu setelah acara ini selesai.
        </p>
      )}

      <p className="text-xs text-neutral-slate/70 font-body italic">
        Terima kasih sudah menjadi bagian dari kenangan ini.
      </p>
    </div>
  );
}
