"use client";

import { Calendar, MapPin } from "lucide-react";
import type { PublicEventInfo } from "@/types";
import { getEventCategoryLabel } from "@/lib/event-categories";

interface EventCoverScreenProps {
  event: PublicEventInfo;
  onContinue: () => void;
}

function formatEventDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

// Guest flow (Volume 5 & 3): Scan QR → Cover acara (halaman ini) → Camera
// Permission → Choose Film → Capture → Upload. Cover ini murni tampilan;
// belum ada request izin kamera apa pun sampai guest menekan tombol lanjut.
export function EventCoverScreen({ event, onContinue }: EventCoverScreenProps) {
  const formattedDate = formatEventDate(event.eventDate);

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-midnight">
      {event.coverImage ? (
        <img
          src={event.coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-crimson/30 via-neutral-midnight to-neutral-midnight" />
      )}

      {/* Scrim supaya teks tetap terbaca di atas foto apa pun */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

      <div className="relative z-10 flex h-full w-full flex-col justify-end px-8 pb-10 pt-16 text-neutral-white">
        <div className="space-y-3">
          <p className="font-body text-xs uppercase tracking-widest text-neutral-white/60">
            Kamu diundang ke {getEventCategoryLabel(event.category)}
          </p>
          <h1 className="font-heading text-3xl font-semibold leading-tight">
            {event.title}
          </h1>

          {(formattedDate || event.location) && (
            <div className="space-y-1.5 pt-1">
              {formattedDate && (
                <div className="flex items-center gap-2 text-sm text-neutral-white/80 font-body">
                  <Calendar size={16} className="shrink-0 text-neutral-white/60" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-neutral-white/80 font-body">
                  <MapPin size={16} className="shrink-0 text-neutral-white/60" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 w-full rounded-md bg-crimson py-3.5 font-body font-medium text-neutral-white active:scale-95 transition-transform"
        >
          Buka Kenang Camera
        </button>
        <p className="mt-3 text-center text-xs text-neutral-white/50 font-body">
          Scan. Jepret. Kenang.
        </p>
      </div>
    </div>
  );
}
