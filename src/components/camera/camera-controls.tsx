"use client";

import { Zap, ZapOff, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Kontrol atas/bawah sekarang duduk di letterbox hitam solid (bukan
// ngambang di atas viewfinder), jadi chip bg + backdrop-blur lama sudah
// tidak perlu — cukup ikon polos di atas hitam, persis Camera app iPhone.

export function FlashToggle({
  value,
  onChange,
}: {
  value: "auto" | "on" | "off";
  onChange: (v: "auto" | "on" | "off") => void;
}) {
  const cycle = () => {
    const order: Array<"auto" | "on" | "off"> = ["auto", "on", "off"];
    const next = order[(order.indexOf(value) + 1) % order.length];
    onChange(next);
  };

  return (
    <button
      type="button"
      aria-label={`Flash: ${value}`}
      onClick={cycle}
      className="flex h-11 w-11 items-center justify-center text-neutral-white active:opacity-60"
    >
      {value === "off" ? <ZapOff size={22} /> : <Zap size={22} className={value === "on" ? "text-gold" : ""} />}
    </button>
  );
}

export function CameraFlipButton({ onFlip }: { onFlip: () => void }) {
  return (
    <button
      type="button"
      aria-label="Balik kamera"
      onClick={onFlip}
      className="flex h-11 w-11 items-center justify-center text-neutral-white active:opacity-60"
    >
      <RefreshCw size={22} />
    </button>
  );
}

export function ExitButton({ onExit }: { onExit: () => void }) {
  return (
    <button
      type="button"
      aria-label="Keluar dari kamera"
      onClick={onExit}
      className="flex h-11 w-11 items-center justify-center text-neutral-white active:opacity-60"
    >
      <X size={22} />
    </button>
  );
}

export function ShotCounter({
  shotsTaken,
  remaining,
}: {
  shotsTaken: number;
  remaining: number | null;
}) {
  return (
    <div className="font-mono text-sm text-neutral-white tabular-nums">
      {remaining === null ? `${shotsTaken} / ∞` : `${remaining} tersisa`}
    </div>
  );
}
