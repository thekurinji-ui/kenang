import { LandingNavbar } from "@/components/landing/navbar";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFaq } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";

export const metadata = {
  title: "Harga — Kenang Kurinji",
  description:
    "Bayar per event, bukan langganan bulanan. Bandingkan paket Kincai, Kurinji, Gunung Tujuh, dan Gunung Kerinci.",
};

export default function HargaPage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />
      <div className="pt-6">
        <LandingPricing />
      </div>
      <LandingFaq />
      <LandingFooter />
    </main>
  );
}
