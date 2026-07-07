import Image from "next/image";

/**
 * Full lock (Blueprint v2.1 — Roll Film & Masa Aktif): ditampilkan ketika
 * guest membuka link event yang masa aktifnya sudah lewat (30 hari untuk
 * Kincai, 1 tahun untuk Kurinji/Gunung Tujuh). Guest tidak bisa mengakses
 * Kenang Camera sama sekali lagi — beda dengan "Roll Film Selesai" (jatah
 * jepretan habis) yang cuma mengunci kamera, bukan seluruh event.
 */
export function ExpiredEventScreen({ eventTitle }: { eventTitle: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-neutral-midnight text-neutral-white px-8 text-center">
      <Image
        src="/logo.png"
        alt="Kenang Kurinji"
        width={220}
        height={112}
        className="h-16 w-auto brightness-0 invert opacity-80"
      />
      <div className="space-y-2">
        <h1 className="font-heading text-xl font-semibold">Masa Aktif Telah Berakhir</h1>
        <p className="font-body text-sm text-neutral-slate max-w-xs">
          Masa aktif untuk &ldquo;{eventTitle}&rdquo; sudah selesai. Kenang Camera untuk
          event ini tidak bisa diakses lagi.
        </p>
      </div>
      <p className="text-xs text-neutral-slate/70 font-body italic">
        Hubungi host acara kalau kamu merasa ini keliru.
      </p>
    </div>
  );
}
