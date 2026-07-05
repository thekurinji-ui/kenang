"use client";

import { CheckCircle2, CloudOff, Loader2, RotateCcw } from "lucide-react";
import type { CameraState } from "@/types";

interface UploadProgressProps {
  state: CameraState;
  errorMessage: string | null;
  onRetry: () => void;
}

export function UploadProgress({ state, errorMessage, onRetry }: UploadProgressProps) {
  if (state === "uploading") {
    return (
      <Overlay>
        <Loader2 className="animate-spin text-neutral-white" size={32} />
        <p className="font-body text-sm text-neutral-white">Menyimpan kenanganmu…</p>
      </Overlay>
    );
  }

  if (state === "success") {
    return (
      <Overlay tone="success">
        <CheckCircle2 className="text-gold" size={32} />
        <p className="font-body text-sm text-neutral-white">Momen tersimpan!</p>
      </Overlay>
    );
  }

  if (state === "offline") {
    return (
      <Overlay tone="warn">
        <CloudOff className="text-neutral-white" size={32} />
        <p className="font-body text-sm text-neutral-white text-center px-6">
          Koneksi terputus. Foto akan diunggah otomatis saat kembali online.
        </p>
      </Overlay>
    );
  }

  if (state === "failed") {
    return (
      <Overlay tone="error">
        <p className="font-body text-sm text-neutral-white text-center px-6">
          {errorMessage ?? "Upload gagal."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-md bg-crimson px-4 py-2 text-sm font-medium text-neutral-white"
        >
          <RotateCcw size={16} /> Coba Lagi
        </button>
      </Overlay>
    );
  }

  return null;
}

function Overlay({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warn" | "error";
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-neutral-midnight/70 backdrop-blur-sm animate-fade-in">
      {children}
    </div>
  );
}
