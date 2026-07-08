import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FILM_COLLECTION, type FilmLutShowcase } from "@/lib/film-collection";

// Homepage Blueprint v3.3 — Section 10 (Film Collection)
// Layout "fan of cards": kartu saling tumpuk & memutar dari titik tengah,
// kartu paling tengah tetap tegak dan tampil paling depan (mirip kartu UNO
// yang dikipas).
export function LandingFilmCollection() {
  const total = FILM_COLLECTION.length;
  const heroIndex = Math.floor((total - 1) / 2);

  return (
    <section className="overflow-hidden bg-neutral-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Film Collection
          </h2>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Delapan karakter warna, satu roll film digital. Pilih sesuai mood
            acaramu.
          </p>
        </div>

        <div className="no-scrollbar mt-16 flex items-end justify-center overflow-x-auto px-4 pb-10 pt-8 md:overflow-visible md:px-0">
          {FILM_COLLECTION.map((film, i) => (
            <FilmCard
              key={film.slug}
              film={film}
              offset={i - heroIndex}
              isFirst={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilmCard({
  film,
  offset,
  isFirst,
}: {
  film: FilmLutShowcase;
  offset: number;
  isFirst: boolean;
}) {
  const isHero = offset === 0;
  const rotate = offset * 7; // derajat kemiringan tiap kartu dari titik tengah
  const drop = Math.abs(offset) * 6; // makin jauh dari tengah, makin turun
  const z = 50 - Math.abs(offset) * 5; // kartu tengah selalu paling atas

  return (
    <div
      style={
        {
          "--rotate": `${rotate}deg`,
          "--drop": `${drop}px`,
          zIndex: z,
        } as CSSProperties
      }
      className={`group relative w-36 shrink-0 origin-bottom overflow-hidden rounded-xl bg-neutral-midnight shadow-medium transition-all duration-300 ease-out rotate-[var(--rotate)] translate-y-[var(--drop)] hover:z-50 hover:-translate-y-6 hover:rotate-0 hover:scale-105 hover:shadow-floating sm:w-44 md:w-52 ${
        isHero ? "scale-105 shadow-floating md:scale-110" : ""
      } ${isFirst ? "" : "-ml-20 sm:-ml-24 md:-ml-28"}`}
    >
      <div className="relative aspect-[3/4]">
        <Image
          src={film.image}
          alt={`Preview karakter warna ${film.name}`}
          fill
          sizes="(min-width: 768px) 208px, 144px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-midnight/90 via-neutral-midnight/15 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
        <span className="font-heading text-base font-semibold text-neutral-white">
          {film.name}
        </span>
        <span className="font-body text-xs leading-relaxed text-neutral-white/70">
          {film.character}
        </span>
        <Link
          href="/e/pernikahan-demo"
          className="mt-2 inline-flex w-fit items-center rounded-full bg-neutral-white/90 px-3.5 py-1.5 font-body text-xs font-medium text-neutral-midnight transition-colors hover:bg-neutral-white"
        >
          Gunakan Filter
        </Link>
      </div>
    </div>
  );
}
