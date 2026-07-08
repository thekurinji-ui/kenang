import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingSocialProof } from "@/components/landing/social-proof";
import { LandingEmotionalStory } from "@/components/landing/emotional-story";
import { LandingProblem } from "@/components/landing/problem";
import { LandingSolution } from "@/components/landing/solution";
import { LandingTestimonial } from "@/components/landing/testimonial";
import { LandingDisposableExperience } from "@/components/landing/disposable-experience";
import { LandingFilmStripMemories } from "@/components/landing/film-strip-memories";
import { LandingFilmCollection } from "@/components/landing/film-collection";
import { LandingBeforeAfter } from "@/components/landing/before-after";
import { LandingAiFeatures } from "@/components/landing/ai-features";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFaq } from "@/components/landing/faq";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

// Homepage Blueprint v3.3 — urutan section sesuai diagram alur:
// Navbar → Hero → Social Proof → Emotional Story → Problem → Solution →
// Testimoni → Disposable Experience → Film Strip Memories → Film Collection →
// Before & After LUT → AI Features → Pricing → FAQ → CTA → Footer
export default function HomePage() {
  return (
    <main className="min-h-dvh bg-neutral-white">
      <LandingNavbar />
      <LandingHero />
      <LandingSocialProof />
      <LandingEmotionalStory />
      <LandingProblem />
      <LandingSolution />
      <LandingTestimonial />
      <LandingDisposableExperience />
      <LandingFilmStripMemories />
      <LandingFilmCollection />
      <LandingBeforeAfter />
      <LandingAiFeatures />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
