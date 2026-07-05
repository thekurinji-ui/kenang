"use client";

import { FILM_COLLECTION, type FilmId } from "@/lib/films";
import { cn } from "@/lib/utils";

interface FilmSelectorProps {
  selected: FilmId;
  onSelect: (id: FilmId) => void;
}

export function FilmSelector({ selected, onSelect }: FilmSelectorProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div className="flex gap-3 px-4 py-2 w-max mx-auto">
        {FILM_COLLECTION.map((film) => {
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
              <span
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition-all",
                  active ? "border-neutral-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: film.swatch }}
              />
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
