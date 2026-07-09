"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FILM_COLLECTION, type FilmLutShowcase } from "@/lib/film-collection";

// Homepage Blueprint v3.3 — Section 10 (Film Collection)
// Layout "fan of cards": kartu saling tumpuk & memutar dari titik tengah,
// kartu paling tengah tetap tegak dan tampil paling depan (mirip kartu UNO
// yang dikipas). Klik kartu -> membesar & pindah ke tengah layar (shared
// layout animation via framer-motion layoutId), klik lagi di luar / tombol X
// buat balik ke posisi asalnya di kipas.
export function LandingFilmCollection() {
  const total = FILM_COLLECTION.length;
  const heroIndex = Math.floor((total - 1) / 2);
  const [selected, setSelected] = useState<FilmLutShowcase | null>(null);

  // Kunci scroll body selagi kartu terbuka, biar fokus ke preview-nya.
  useEffect(() => {
    if (selected) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selected]);

  // Tombol Escape juga bisa nutup preview.
  useEffect(() => {
    if (!selected) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

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
              isSelected={selected?.slug === film.slug}
              onSelect={() => setSelected(film)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <FilmPreviewOverlay
            film={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function FilmCard({
  film,
  offset,
  isFirst,
  isSelected,
  onSelect,
}: {
  film: FilmLutShowcase;
  offset: number;
  isFirst: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isHero = offset === 0;
  const rotate = offset * 7; // derajat kemiringan tiap kartu dari titik tengah
  const drop = Math.abs(offset) * 6; // makin jauh dari tengah, makin turun
  const z = 50 - Math.abs(offset) * 5; // kartu tengah selalu paling atas

  function handleFilterClick(e: MouseEvent) {
    // Jangan sampai klik tombol "Gunakan Filter" ikut ke-treat sebagai buka
    // preview (dua interaksi beda dalam satu kartu).
    e.stopPropagation();
  }

  return (
    <div
      style={
        {
          "--rotate": `${rotate}deg`,
          "--drop": `${drop}px`,
          zIndex: z,
        } as CSSProperties
      }
      className={`relative w-36 shrink-0 origin-bottom rotate-[var(--rotate)] translate-y-[var(--drop)] transition-transform duration-300 ease-out hover:z-50 hover:-translate-y-6 hover:rotate-0 sm:w-44 md:w-52 ${
        isFirst ? "" : "-ml-20 sm:-ml-24 md:-ml-28"
      }`}
    >
      {/* Kartu asli disembunyikan (bukan di-unmount) selagi preview terbuka,
          supaya slot di kipas tetap kejaga dan layoutId punya satu pemilik
          visual yang jelas buat di-morph ke overlay. */}
      <motion.button
        type="button"
        layoutId={`film-card-${film.slug}`}
        onClick={onSelect}
        aria-label={`Lihat preview karakter warna ${film.name}`}
        whileTap={{ scale: 0.96 }}
        className={`group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-xl bg-neutral-midnight text-left shadow-medium transition-[box-shadow,transform] duration-300 ease-out hover:scale-105 hover:shadow-floating ${
          isHero ? "scale-105 shadow-floating md:scale-110" : ""
        } ${isSelected ? "invisible" : ""}`}
      >
        <Image
          src={film.image}
          alt={`Preview karakter warna ${film.name}`}
          fill
          sizes="(min-width: 768px) 208px, 144px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-midnight/90 via-neutral-midnight/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
          <span className="font-heading text-base font-semibold text-neutral-white">
            {film.name}
          </span>
          <span className="font-body text-xs leading-relaxed text-neutral-white/70">
            {film.character}
          </span>
          <Link
            href="/e/pernikahan-demo"
            onClick={handleFilterClick}
            className="mt-2 inline-flex w-fit items-center rounded-full bg-neutral-white/90 px-3.5 py-1.5 font-body text-xs font-medium text-neutral-midnight transition-colors hover:bg-neutral-white"
          >
            Gunakan Filter
          </Link>
        </div>
      </motion.button>
    </div>
  );
}

function FilmPreviewOverlay({
  film,
  onClose,
}: {
  film: FilmLutShowcase;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-midnight/70 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        layoutId={`film-card-${film.slug}`}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-2xl bg-neutral-midnight shadow-floating sm:max-w-sm md:max-w-md"
      >
        <Image
          src={film.image}
          alt={`Preview karakter warna ${film.name}`}
          fill
          sizes="(min-width: 768px) 448px, 90vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-midnight/95 via-neutral-midnight/20 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup preview"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-white/90 text-neutral-midnight transition-colors hover:bg-neutral-white"
        >
          <X size={18} />
        </button>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6">
          <span className="font-heading text-2xl font-semibold text-neutral-white">
            {film.name}
          </span>
          <span className="font-body text-sm leading-relaxed text-neutral-white/70">
            {film.character}
          </span>
          <Link
            href="/e/pernikahan-demo-fucr"
            className="mt-3 inline-flex w-fit items-center rounded-full bg-neutral-white/90 px-4 py-2 font-body text-sm font-medium text-neutral-midnight transition-colors hover:bg-neutral-white"
          >
            Gunakan Filter
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
