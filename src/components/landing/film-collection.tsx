import Image from "next/image";
import Link from "next/link";
import { FILM_COLLECTION, type FilmLutShowcase } from "@/lib/film-collection";

// Homepage Blueprint v3.3 — Section 10 (Film Collection)
export function LandingFilmCollection() {
  return (
    <section className="bg-neutral-white px-6 py-20 md:py-28">
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

        <div className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-8 pt-4">
          {FILM_COLLECTION.map((film, i) => (
            <FilmCard key={film.slug} film={film} tiltLeft={i % 2 === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilmCard({
  film,
  tiltLeft,
}: {
  film: FilmLutShowcase;
  tiltLeft: boolean;
}) {
  return (
    <div
      className={`group relative w-56 shrink-0 snap-center overflow-hidden rounded-xl bg-neutral-midnight shadow-medium transition-all duration-300 ease-out hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-floating md:w-64 ${
        tiltLeft ? "-rotate-2" : "rotate-2"
      }`}
    >
      <div className="relative aspect-[3/4]">
        <Image
          src={film.image}
          alt={`Preview karakter warna ${film.name}`}
          fill
          sizes="(min-width: 768px) 256px, 224px"
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
