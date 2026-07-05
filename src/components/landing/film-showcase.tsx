import { FILM_COLLECTION } from "@/lib/films";

export function LandingFilmShowcase() {
  return (
    <section id="film" className="bg-neutral-midnight px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold text-neutral-white md:text-4xl">
            6 Karakter Film Analog
          </h2>
          <p className="mt-3 font-body text-neutral-white/60">
            Terinspirasi dari roll film ikonik — biarkan tamu memilih mood
            mereka sendiri di setiap jepretan.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FILM_COLLECTION.map((film) => (
            <div
              key={film.id}
              className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 shrink-0 rounded-full border border-white/20"
                  style={{ backgroundColor: film.swatch }}
                  aria-hidden
                />
                <div>
                  <p className="font-heading text-sm font-semibold text-neutral-white">
                    {film.name}
                  </p>
                  <p className="font-body text-xs text-neutral-white/40">
                    {film.inspiredBy}
                  </p>
                </div>
              </div>
              <p className="mt-3 font-body text-sm leading-relaxed text-neutral-white/60">
                {film.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
