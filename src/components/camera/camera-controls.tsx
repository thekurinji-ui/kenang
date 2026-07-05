"use client";

import { Zap, ZapOff, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className="h-11 w-11 rounded-full bg-neutral-midnight/40 backdrop-blur-sm flex items-center justify-center text-neutral-white"
    >
      {value === "off" ? <ZapOff size={20} /> : <Zap size={20} className={value === "on" ? "text-gold" : ""} />}
    </button>
  );
}

export function CameraFlipButton({ onFlip }: { onFlip: () => void }) {
  return (
    <button
      type="button"
      aria-label="Balik kamera"
      onClick={onFlip}
      className="h-11 w-11 rounded-full bg-neutral-midnight/40 backdrop-blur-sm flex items-center justify-center text-neutral-white"
    >
      <RefreshCw size={20} />
    </button>
  );
}

export function ExitButton({ onExit }: { onExit: () => void }) {
  return (
    <button
      type="button"
      aria-label="Keluar dari kamera"
      onClick={onExit}
      className="h-11 w-11 rounded-full bg-neutral-midnight/40 backdrop-blur-sm flex items-center justify-center text-neutral-white"
    >
      <X size={20} />
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
    <div
      className={cn(
        "px-3 py-1.5 rounded-md bg-neutral-midnight/40 backdrop-blur-sm",
        "font-mono text-sm text-neutral-white tabular-nums"
      )}
    >
      {remaining === null ? `${shotsTaken} / ∞` : `${remaining} tersisa`}
    </div>
  );
}
