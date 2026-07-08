import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

// Homepage Blueprint v3.3 — Section 4 (Testimoni)
const AVATAR_BG: Record<Testimonial["avatarColor"], string> = {
  crimson: "bg-crimson-100 text-crimson-700",
  royal: "bg-royal-50 text-royal-600",
  gold: "bg-gold-400/20 text-gold-500",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function LandingTestimonial() {
  return (
    <section className="bg-neutral-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-xl text-center md:mb-16">
          <h2 className="font-heading text-3xl font-semibold text-neutral-midnight md:text-4xl">
            Setiap Kenangan Punya Ceritanya Sendiri.
          </h2>
        </div>

        <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="flex w-[82%] shrink-0 snap-center flex-col gap-4 p-6 sm:w-[60%] md:w-auto md:shrink">
      <div className="flex items-center gap-1" aria-label={`Rating ${testimonial.rating} dari 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < testimonial.rating
                ? "fill-gold-500 text-gold-500"
                : "fill-neutral-slate text-neutral-slate"
            }
          />
        ))}
      </div>

      <p className="font-body text-sm leading-relaxed text-neutral-midnight/80">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="mt-auto flex items-center gap-3 pt-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold ${AVATAR_BG[testimonial.avatarColor]}`}
          aria-hidden
        >
          {getInitials(testimonial.name)}
        </div>
        <div>
          <p className="font-body text-sm font-semibold text-neutral-midnight">
            {testimonial.name}
          </p>
          <p className="font-body text-xs text-neutral-midnight/50">{testimonial.role}</p>
        </div>
      </div>
    </Card>
  );
}
