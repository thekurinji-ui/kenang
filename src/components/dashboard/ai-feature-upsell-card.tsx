import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/plans";

export function AiFeatureUpsellCard() {
  return (
    <Card className="p-6 space-y-3 border-dashed">
      <h2 className="font-heading font-semibold text-neutral-midnight flex items-center gap-1.5">
        <Sparkles size={16} className="text-crimson" /> Fitur AI
      </h2>
      <p className="font-body text-sm text-neutral-midnight/60">
        AI Best Shot, AI Story, dan AI Smart Gallery tersedia mulai paket{" "}
        <strong>{PLAN_LIMITS.GUNUNG_TUJUH.name}</strong> ke atas. Upgrade untuk otomatis dapat
        foto terbaik, cerita momen, dan galeri yang sudah dikelompokkan sendiri.
      </p>
      <Link href="/dashboard/subscription">
        <Button variant="secondary">Lihat Paket</Button>
      </Link>
    </Card>
  );
}
