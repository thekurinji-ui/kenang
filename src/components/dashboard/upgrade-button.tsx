"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UpgradeButtonProps {
  plan: "PLUS" | "PRO";
}

export function UpgradeButton({ plan }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message ?? "Gagal memulai pembayaran");
        setLoading(false);
        return;
      }
      window.location.href = json.data.redirectUrl;
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 w-full">
      <Button className="w-full" onClick={handleUpgrade} isLoading={loading}>
        Upgrade
      </Button>
      {error && <p className="mt-2 font-body text-xs text-crimson text-center">{error}</p>}
    </div>
  );
}
