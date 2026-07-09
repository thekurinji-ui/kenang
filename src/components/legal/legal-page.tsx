import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  intro?: string;
  children: React.ReactNode;
}

// Wrapper konsisten untuk semua halaman Legal (Kebijakan Privasi, Syarat &
// Ketentuan, dst). Pakai plugin @tailwindcss/typography ("prose") supaya
// heading/list/paragraf di tiap dokumen otomatis rapi tanpa perlu styling
// manual di tiap file, tapi tetap disesuaikan ke token warna & font brand
// (font-heading, font-body, neutral-midnight) lewat modifier prose-*.
export function LegalPage({ title, effectiveDate, intro, children }: LegalPageProps) {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-crimson">
            Legal
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 font-body text-sm text-neutral-midnight/50">
            Terakhir diperbarui: {effectiveDate}
          </p>

          {intro && (
            <p className="mt-6 font-body leading-relaxed text-neutral-midnight/70">{intro}</p>
          )}

          <div
            className={[
              "prose prose-neutral mt-10 max-w-none",
              "prose-headings:font-heading prose-headings:font-semibold prose-headings:text-neutral-midnight",
              "prose-h2:mt-10 prose-h2:text-xl prose-h3:mt-6 prose-h3:text-base",
              "prose-p:font-body prose-p:leading-relaxed prose-p:text-neutral-midnight/70",
              "prose-li:font-body prose-li:text-neutral-midnight/70",
              "prose-strong:text-neutral-midnight",
              "prose-a:text-crimson prose-a:no-underline hover:prose-a:underline",
              "prose-hr:border-neutral-slate",
            ].join(" ")}
          >
            {children}
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
