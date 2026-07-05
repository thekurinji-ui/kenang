import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingFilmShowcase } from "@/components/landing/film-showcase";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />
      <LandingHero />
      <LandingHowItWorks />
      <LandingFilmShowcase />
      <LandingPricing />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
