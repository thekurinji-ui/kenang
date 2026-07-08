"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { MoveHorizontal } from "lucide-react";

// Homepage Blueprint v3.3 — Section 11 (Before & After LUT)
// Pakai foto yang sama dengan Film Collection: original.jpg (sebelum) vs
// fuji-eterna-250d.jpg (sesudah) — LUT flagship yang juga muncul di mockup Hero.
const BEFORE_IMAGE = "/film-collection/original.jpg";
const AFTER_IMAGE = "/film-collection/fuji-eterna-250d.jpg";

export function LandingBeforeAfter() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    updateFromClientX(e.clientX);
  };
  const stopDragging = () => {
    isDragging.current = false;
  };

  return (
    <section className="bg-neutral-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
          Before & After
        </h2>
        <p className="mt-3 font-body text-neutral-midnight/70">
          Geser buat lihat bedanya sebelum dan sesudah pakai Film Collection.
        </p>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
        className="relative mx-auto mt-12 aspect-[4/3] w-full max-w-2xl touch-none select-none overflow-hidden rounded-xl shadow-medium sm:aspect-[16/10]"
      >
        <Image
          src={AFTER_IMAGE}
          alt="Sesudah pakai Film Collection"
          fill
          sizes="(min-width: 640px) 672px, 100vw"
          className="pointer-events-none object-cover"
          draggable={false}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={BEFORE_IMAGE}
            alt="Sebelum pakai Film Collection"
            fill
            sizes="(min-width: 640px) 672px, 100vw"
            className="pointer-events-none object-cover"
            draggable={false}
          />
        </div>

        <div
          className="absolute inset-y-0 w-0.5 bg-neutral-white/90"
          style={{ left: `${position}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-white shadow-medium">
            <MoveHorizontal size={16} className="text-neutral-midnight" />
          </div>
        </div>

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-neutral-midnight/60 px-2.5 py-1 font-mono text-[10px] tracking-wide text-neutral-white">
          SEBELUM
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-neutral-midnight/60 px-2.5 py-1 font-mono text-[10px] tracking-wide text-neutral-white">
          SESUDAH
        </span>
      </div>
    </section>
  );
}
