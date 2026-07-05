"use client";

import { Camera } from "lucide-react";

interface PermissionScreenProps {
  eventTitle: string;
  errorMessage: string | null;
  onRequestPermission: () => void;
}

export function PermissionScreen({
  eventTitle,
  errorMessage,
  onRequestPermission,
}: PermissionScreenProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-neutral-midnight text-neutral-white px-8 text-center">
      <div className="h-20 w-20 rounded-full bg-crimson/15 flex items-center justify-center">
        <Camera size={36} className="text-crimson" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-xl font-semibold">{eventTitle}</h1>
        <p className="font-body text-sm text-neutral-slate max-w-xs">
          Kenang Camera butuh akses kamera untuk mengabadikan momenmu di acara ini.
          Tidak perlu aplikasi, tidak perlu login.
        </p>
      </div>
      {errorMessage && (
        <p className="text-sm text-crimson bg-crimson/10 rounded-md px-4 py-2 max-w-xs">
          {errorMessage}
        </p>
      )}
      <button
        type="button"
        onClick={onRequestPermission}
        className="w-full max-w-xs rounded-md bg-crimson py-3.5 font-body font-medium active:scale-95 transition-transform"
      >
        Aktifkan Kamera
      </button>
      <p className="text-xs text-neutral-slate/70 font-body">
        Scan. Jepret. Kenang.
      </p>
    </div>
  );
}
