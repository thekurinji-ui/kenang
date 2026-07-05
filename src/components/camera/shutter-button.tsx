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
        "bg-neutral-white/20 backdrop-blur-sm active:animate-scale-tap",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "flex items-center justify-center transition-transform"
      )}
    >
      <span
        className={cn(
          "h-[68px] w-[68px] rounded-full bg-neutral-white shadow-floating",
          disabled ? "bg-neutral-slate" : "bg-crimson"
        )}
      />
    </button>
  );
}
