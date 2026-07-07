import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { CheckoutBanner } from "@/components/dashboard/checkout-banner";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS, isCheckoutPlan, type PlanId } from "@/lib/plans";

const PLAN_DESCRIPTIONS: Record<PlanId, string> = {
  KINCAI: "Cukup untuk mencoba di acara kecil.",
  KURINJI: "Pas untuk ulang tahun, gathering, dan acara komunitas.",
  GUNUNG_TUJUH: "Untuk pernikahan dan acara besar dengan banyak tamu.",
  GUNUNG_KERINCI: "Untuk vendor & event organizer dengan banyak acara.",
};

const PLANS = (Object.keys(PLAN_LIMITS) as PlanId[]).map((id) => {
  const plan = PLAN_LIMITS[id];
  return {
    id,
    name: plan.name,
    price: plan.priceLabel,
    description: PLAN_DESCRIPTIONS[id],
    features: plan.features,
  };
});

export default async function SubscriptionPage() {
  const session = await auth();
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session!.user.id },
  });
  const currentPlan: PlanId = subscription?.plan ?? "KINCAI";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">
          Subscription
        </h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Kamu sedang menggunakan plan{" "}
          <span className="font-medium text-crimson">{PLAN_LIMITS[currentPlan].name}</span>.
        </p>
      </div>

      <Suspense fallback={null}>
        <CheckoutBanner />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col p-6",
                isCurrent && "border-crimson bg-crimson-50/40 shadow-medium"
              )}
            >
              {isCurrent && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-crimson px-3 py-1 font-body text-xs font-semibold text-neutral-white">
                  Plan Aktif
                </span>
              )}
              <h3 className="font-heading text-lg font-semibold text-neutral-midnight">
                {plan.name}
              </h3>
              <p className="mt-1 font-body text-sm text-neutral-midnight/60">
                {plan.description}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-2xl font-semibold text-neutral-midnight">
                  {plan.price}
                </span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 font-body text-sm text-neutral-midnight/80"
                  >
                    <span className="mt-0.5 text-crimson" aria-hidden>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="secondary" className="mt-6 w-full" disabled>
                  Plan Saat Ini
                </Button>
              ) : isCheckoutPlan(plan.id) ? (
                <UpgradeButton plan={plan.id} />
              ) : plan.id === "KINCAI" ? (
                <Button variant="secondary" className="mt-6 w-full" disabled>
                  Plan Dasar
                </Button>
              ) : (
                <a href="/contact">
                  <Button variant="secondary" className="mt-6 w-full">
                    Hubungi Kami
                  </Button>
                </a>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="font-heading font-semibold text-neutral-midnight">Pembayaran</h2>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Pembayaran diproses aman lewat Midtrans — mendukung transfer bank, GoPay, OVO, DANA, QRIS, dan kartu kredit/debit.
        </p>
      </Card>
    </div>
  );
}
