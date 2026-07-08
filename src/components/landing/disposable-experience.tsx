// Homepage Blueprint v3.3 — Section 9 (Disposable Experience / "cuci film")
//
// Catatan: blueprint minta video/.webm atau Lottie. Di sini dibikin murni
// pakai CSS animation (filter blur→brightness→saturate, loop ~4 detik) —
// hasilnya setara secara visual (autoplay, muted secara alami, loop halus,
// tanpa perlu interaksi) tapi tanpa aset video yang perlu di-hosting/di-buffer.
// Kalau nanti mau upgrade ke video/Lottie asli, section ini tinggal diganti
// isinya, struktur & copy-nya bisa dipakai lagi.
export function LandingDisposableExperience() {
  return (
    <section className="bg-neutral-midnight px-6 py-16 md:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="w-[220px] rounded-lg bg-neutral-white p-3 pb-7 shadow-floating md:w-[260px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-neutral-midnight">
            {/* Warm candid "photo" — sama motif dengan hero, biar konsisten */}
            <div className="absolute inset-0 animate-film-develop bg-[radial-gradient(circle_at_30%_25%,#F5A609_0%,transparent_45%),radial-gradient(circle_at_75%_40%,#D62828_0%,transparent_50%),radial-gradient(circle_at_50%_85%,#1D4ED8_0%,transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_35%,rgba(17,24,39,0.6)_100%)]" />

            {/* Timestamp ala kamera analog — muncul begitu foto "jernih" */}
            <div className="absolute inset-x-2.5 bottom-2 flex animate-film-label-reveal items-center justify-between font-mono text-[9px] tracking-wide text-neutral-white/80">
              <span>12:04 PM</span>
              <span>KENANG KURINJI</span>
            </div>
          </div>
        </div>

        <p className="max-w-md font-body text-sm text-neutral-white/70 md:text-base">
          Seperti film asli, hasilnya butuh waktu untuk terungkap. Tapi begitu
          muncul — momen itu jadi abadi.
        </p>
      </div>
    </section>
  );
}
