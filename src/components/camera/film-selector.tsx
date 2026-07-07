"use client";

import { type FilmId, type FilmPreset } from "@/lib/films";
import { cn } from "@/lib/utils";

interface FilmSelectorProps {
  selected: FilmId;
  onSelect: (id: FilmId) => void;
  /** Film yang boleh ditampilkan — sudah difilter sesuai plan event lewat
   * `getFilmsForPlan(plan)` di pemanggil (lihat kenang-camera.tsx). */
  films: FilmPreset[];
}

export function FilmSelector({ selected, onSelect, films }: FilmSelectorProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-3 px-4 py-2 w-max mx-auto">
        {films.map((film) => {
          const active = film.id === selected;
          return (
            <button
              key={film.id}
              type="button"
              onClick={() => onSelect(film.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 shrink-0 transition-opacity",
                active ? "opacity-100" : "opacity-60"
              )}
            >
              <span className="relative">
                <span
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-all block",
                    active ? "border-neutral-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: film.swatch }}
                />
                {film.tier === "PREMIUM" && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-400 border border-black/20"
                    aria-label="Film premium"
                    title="Film Collection premium"
                  />
                )}
              </span>
              <span className="text-[11px] font-body text-neutral-white whitespace-nowrap">
                {film.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
