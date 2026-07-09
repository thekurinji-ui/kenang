"use client";

import { cn } from "@/lib/utils";

interface ShutterButtonProps {
  onCapture: () => void;
  disabled?: boolean;
}

export function ShutterButton({ onCapture, disabled }: ShutterButtonProps) {
  return (
    <button
      type="button"
      aria-label="Ambil foto"
      disabled={disabled}
      onClick={onCapture}
      className={cn(
        "relative h-20 w-20 rounded-full border-4 border-neutral-white",
        "active:animate-scale-tap",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "flex items-center justify-center transition-opacity"
      )}
    >
      {/* Selalu bulat putih polos — persis shutter Camera app iPhone,
          gak lagi ganti warna sesuai state (dulu crimson/abu-abu). */}
      <span className="h-[68px] w-[68px] rounded-full bg-neutral-white shadow-floating" />
    </button>
  );
}
