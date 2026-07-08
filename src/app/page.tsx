import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingFilmShowcase } from "@/components/landing/film-showcase";
import { LandingAiFeatures } from "@/components/landing/ai-features";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFaq } from "@/components/landing/faq";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />
      <LandingHero />
      <LandingHowItWorks />
      <LandingFilmShowcase />
      <LandingAiFeatures />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
