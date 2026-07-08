import Image from "next/image";
import { FILM_COLLECTION } from "@/lib/films";

// Homepage Blueprint v3.3 — Section 5 (Film Strip Memories)
//
// Menampilkan 8 film STANDARD (Snap, Road Trip, ISO800, Summer) — film
// default yang dipakai tamu sehari-hari di semua plan, termasuk Kincai
// (gratis). Sengaja beda dari section "Film Collection" (yang menampilkan
// 8 karakter premium Fuji/Kodak), supaya dua section film tidak terasa
// duplikat.
//
// Foto preview-nya BUKAN foto event asli (belum ada pipeline foto
// pilihan dari event sungguhan), tapi juga bukan placeholder gradient —
// ini hasil grading LUT asli (yang sama dipakai di kamera live) diterapkan
// ke satu foto referensi (public/film-collection/original.jpg), lewat
// scripts/generate-standard-previews.py. Jadi warnanya akurat 1:1 dengan
// apa yang bakal dilihat tamu saat motret pakai film ini.
const FRAMES = FILM_COLLECTION; // 8 film STANDARD (snap/road-trip/iso800/summer)

export function LandingFilmStripMemories() {
  // Track digandakan sekali — animasi geser -50% jadi loop mulus.
  const frames = [...FRAMES, ...FRAMES];

  return (
    <section className="overflow-hidden bg-neutral-white py-16 md:py-20">
      <div className="mx-auto mb-10 max-w-2xl px-6 text-center">
        <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
          Setiap Gulungan, Ceritanya Sendiri
        </h2>
        <p className="mt-3 font-body text-neutral-midnight/70">
          Sentuh salah satu untuk lihat karakter film yang dipakai.
        </p>
      </div>

      <div className="group/strip relative flex overflow-hidden">
        <div className="flex w-max shrink-0 animate-marquee gap-4 px-4 [animation-duration:48s] group-hover/strip:[animation-play-state:paused]">
          {frames.map((film, i) => (
            <FilmFrame
              key={`${film.id}-${i}`}
              name={film.name}
              image={film.previewImage ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilmFrame({ name, image }: { name: string; image: string }) {
  return (
    <div className="group/card relative h-48 w-36 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-neutral-midnight shadow-soft transition-transform duration-300 ease-out active:scale-105 md:h-56 md:w-40 md:hover:scale-105 md:hover:shadow-medium">
      <Image
        src={image}
        alt={`Contoh jepretan dengan film ${name}`}
        fill
        sizes="(min-width: 768px) 160px, 144px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-midnight/70 via-transparent to-transparent" />

      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-neutral-midnight/80 px-3 py-2 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-active/card:translate-y-0 group-active/card:opacity-100 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100">
        <span className="font-mono text-[10px] tracking-wide text-neutral-white/90">
          {name}
        </span>
      </div>
    </div>
  );
}
