// Homepage Blueprint v3.3 — Section 6 (Emotional Story)
export function LandingEmotionalStory() {
  return (
    <section className="relative overflow-hidden bg-crimson-50/40 px-6 py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-4xl -translate-x-1/2 bg-[radial-gradient(circle_at_50%_0%,rgba(214,40,40,0.06),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="font-heading text-2xl italic leading-relaxed text-neutral-midnight/90 md:text-4xl">
          Momen-momen kecil sering lewat begitu saja — tersimpan cuma di
          ingatan satu-dua orang yang sempat melihatnya.
        </p>
        <p className="mx-auto mt-8 max-w-xl font-body text-base text-neutral-midnight/60 md:text-lg">
          Kenang Kurinji mengumpulkan sudut pandang semua orang yang hadir,
          jadi satu cerita utuh yang bisa dikenang bersama-sama.
        </p>
      </div>
    </section>
  );
}
