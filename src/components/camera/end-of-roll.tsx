"use client";

import Image from "next/image";

/**
 * Signature Experience (Volume 5): saat jatah foto habis, tampilkan animasi
 * bunga Neelakurinji disertai pesan bahwa setiap momen yang telah diabadikan
 * akan selalu menjadi kenangan.
 */
export function EndOfRoll({ shotsTaken }: { shotsTaken: number }) {
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
      <p className="text-xs text-neutral-slate/70 font-body italic">
        Terima kasih sudah menjadi bagian dari kenangan ini.
      </p>
    </div>
  );
}
