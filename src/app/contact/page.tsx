import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Mail, MapPin, Globe } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Hubungi Kami
          </h1>
          <p className="mt-3 font-body text-neutral-midnight/70">
            Ada pertanyaan, masukan, atau mau upgrade plan? Kami siap bantu.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md space-y-6">
          <div className="flex items-start gap-4 rounded-lg border border-neutral-slate bg-neutral-white p-5 shadow-soft">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-crimson-50 text-crimson">
              <Mail size={18} />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-neutral-midnight">Email</p>
              <p className="mt-1 font-body text-sm text-neutral-midnight/60">
                halo@kurinji.asia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-neutral-slate bg-neutral-white p-5 shadow-soft">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-crimson-50 text-crimson">
              <MapPin size={18} />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-neutral-midnight">Lokasi</p>
              <p className="mt-1 font-body text-sm text-neutral-midnight/60">
                Kurinji Virtual Nusantara (KVN) — Kerinci, Jambi, Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border border-neutral-slate bg-neutral-white p-5 shadow-soft">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-crimson-50 text-crimson">
              <Globe size={18} />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-neutral-midnight">Website</p>
              <p className="mt-1 font-body text-sm text-neutral-midnight/60">
                kenang.kurinji.asia
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}
