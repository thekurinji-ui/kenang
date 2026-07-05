"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckoutBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const checkout = params.get("checkout");
  const [visible, setVisible] = useState(!!checkout);

  useEffect(() => {
    if (!checkout) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      router.replace("/dashboard/subscription");
      router.refresh();
    }, 6000);
    return () => clearTimeout(timer);
  }, [checkout, router]);

  if (!checkout || !visible) return null;

  const config = {
    finish: {
      icon: CheckCircle2,
      className: "border-emerald-300 bg-emerald-50 text-emerald-700",
      text: "Pembayaran diproses. Plan kamu akan aktif begitu Midtrans mengonfirmasi (biasanya beberapa detik).",
    },
    pending: {
      icon: Clock,
      className: "border-gold bg-gold/10 text-gold",
      text: "Pembayaran tertunda. Selesaikan pembayaran sesuai instruksi metode yang kamu pilih.",
    },
    error: {
      icon: XCircle,
      className: "border-crimson bg-crimson-50 text-crimson",
      text: "Pembayaran gagal atau dibatalkan. Silakan coba lagi.",
    },
  }[checkout];

  if (!config) return null;
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4 font-body text-sm", config.className)}>
      <Icon size={18} className="shrink-0" />
      <span>{config.text}</span>
    </div>
  );
}
