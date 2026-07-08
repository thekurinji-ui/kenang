// Homepage Blueprint v3.3 — Section 5 (Film Strip Memories)
//
// Belum ada foto event asli buat ditampilkan di sini, jadi tiap "foto" masih
// berupa gradient hangat placeholder (motif sama dengan Hero & Disposable
// Experience biar konsisten) yang dilabeli nama LUT asli dari Film
// Collection. Begitu ada pipeline foto terbaik/pilihan dari event asli,
// tinggal ganti FILM_FRAMES di bawah dengan data foto sungguhan.
const FILM_FRAMES = [
  { lut: "Fuji Eterna 250D", gradient: "radial-gradient(circle at 30% 30%, #F5A609 0%, transparent 50%), radial-gradient(circle at 70% 70%, #1D4ED8 0%, transparent 55%)" },
  { lut: "Kodak 5218", gradient: "radial-gradient(circle at 65% 25%, #D62828 0%, transparent 50%), radial-gradient(circle at 25% 75%, #FBBF24 0%, transparent 50%)" },
  { lut: "Late Sunset", gradient: "radial-gradient(circle at 50% 20%, #F5A609 0%, transparent 55%), radial-gradient(circle at 50% 90%, #D62828 0%, transparent 45%)" },
  { lut: "Fuji Reala 500D", gradient: "radial-gradient(circle at 20% 60%, #1D4ED8 0%, transparent 50%), radial-gradient(circle at 80% 30%, #FBBF24 0%, transparent 50%)" },
  { lut: "Night From Day", gradient: "radial-gradient(circle at 40% 40%, #1D4ED8 0%, transparent 45%), radial-gradient(circle at 75% 75%, #111827 0%, transparent 60%)" },
  { lut: "Kodak 5295", gradient: "radial-gradient(circle at 60% 65%, #D62828 0%, transparent 50%), radial-gradient(circle at 30% 20%, #F5A609 0%, transparent 50%)" },
  { lut: "Filmstock 50", gradient: "radial-gradient(circle at 45% 50%, #FBBF24 0%, transparent 55%), radial-gradient(circle at 80% 20%, #D62828 0%, transparent 45%)" },
  { lut: "Fuji F125", gradient: "radial-gradient(circle at 35% 70%, #F5A609 0%, transparent 50%), radial-gradient(circle at 70% 35%, #1D4ED8 0%, transparent 50%)" },
];

export function LandingFilmStripMemories() {
  // Track digandakan sekali — animasi geser -50% jadi loop mulus.
  const frames = [...FILM_FRAMES, ...FILM_FRAMES];

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
          {frames.map((frame, i) => (
            <FilmFrame key={i} lut={frame.lut} gradient={frame.gradient} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FilmFrame({ lut, gradient }: { lut: string; gradient: string }) {
  return (
    <div className="group/card relative h-48 w-36 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-neutral-midnight shadow-soft transition-transform duration-300 ease-out active:scale-105 md:h-56 md:w-40 md:hover:scale-105 md:hover:shadow-medium">
      <div
        className="absolute inset-0 opacity-80"
        style={{ backgroundImage: gradient }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_35%,rgba(17,24,39,0.6)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-neutral-midnight/80 px-3 py-2 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-active/card:translate-y-0 group-active/card:opacity-100 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100">
        <span className="font-mono text-[10px] tracking-wide text-neutral-white/90">
          {lut}
        </span>
      </div>
    </div>
  );
}
