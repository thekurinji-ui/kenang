"use client";

import { useState } from "react";
import { getOrCreateDeviceId, setStoredNickname } from "@/lib/utils";

interface GuestNameScreenProps {
  eventTitle: string;
  eventSlug: string;
  onJoined: (nickname: string) => void;
}

// Guest flow (Volume 5 & 3, diperbarui): Scan QR → Cover acara → Isi nama
// (layar ini) → Camera Permission → Choose Film → Capture → Upload.
//
// Layar ini juga yang memanggil POST /api/v1/e/{eventCode}/join — satu-
// satunya tempat di seluruh guest flow yang membuat baris Guest di database.
// Tanpa langkah ini, batas maxGuests plan (lihat src/lib/plans.ts) tidak
// pernah benar-benar tertegak di kondisi nyata karena tidak ada Guest row
// yang bisa dihitung.
export function GuestNameScreen({ eventTitle, eventSlug, onJoined }: GuestNameScreenProps) {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("Nama nggak boleh kosong ya.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch(`/api/v1/e/${encodeURIComponent(eventSlug)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed, deviceId }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(
          json.code === "GUEST_LIMIT_REACHED"
            ? "Yah, kuota tamu untuk event ini sudah penuh. Hubungi host acara ya."
            : json.code === "EVENT_EXPIRED"
              ? "Masa aktif event ini sudah berakhir."
              : (json.message ?? "Gagal bergabung, coba lagi ya.")
        );
        setIsSubmitting(false);
        return;
      }

      setStoredNickname(eventSlug, trimmed);
      onJoined(trimmed);
    } catch {
      setError("Koneksi bermasalah, coba lagi ya.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-end bg-neutral-midnight px-8 pb-10 pt-16 text-neutral-white">
      <div className="absolute inset-0 bg-gradient-to-br from-crimson/30 via-neutral-midnight to-neutral-midnight" />

      <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
        <p className="font-body text-xs uppercase tracking-widest text-neutral-white/60">
          Sebelum jepret di {eventTitle}
        </p>
        <h1 className="font-heading text-2xl font-semibold leading-tight">
          Siapa nama kamu?
        </h1>
        <p className="font-body text-sm text-neutral-white/70">
          Biar host tau siapa yang motret momen ini. Cukup sekali isi kok.
        </p>

        <input
          type="text"
          inputMode="text"
          autoFocus
          maxLength={40}
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Nama kamu"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md border border-neutral-white/20 bg-neutral-white/10 px-4 py-3.5 font-body text-neutral-white placeholder:text-neutral-white/40 outline-none focus:border-crimson"
        />

        {error && <p className="font-body text-sm text-crimson-100">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-md bg-crimson py-3.5 font-body font-medium text-neutral-white active:scale-95 transition-transform disabled:opacity-60"
        >
          {isSubmitting ? "Memproses..." : "Lanjut ke Kamera"}
        </button>
      </form>
    </div>
  );
}
