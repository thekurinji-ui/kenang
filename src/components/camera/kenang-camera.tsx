"use client";

import { useEffect, useMemo, useState } from "react";
import { useCamera } from "@/hooks/use-camera";
import { getFilmsForPlan } from "@/lib/plans";
import { getStoredNickname } from "@/lib/utils";
import { ShutterButton } from "./shutter-button";
import { FilmSelector } from "./film-selector";
import { FlashToggle, CameraFlipButton, ExitButton, ShotCounter } from "./camera-controls";
import { EventCoverScreen } from "./event-cover-screen";
import { GuestNameScreen } from "./guest-name-screen";
import { PermissionScreen } from "./permission-screen";
import { EndOfRoll } from "./end-of-roll";
import { UploadProgress } from "./upload-progress";
import type { PublicEventInfo } from "@/types";

interface KenangCameraProps {
  event: PublicEventInfo;
}

export function KenangCamera({ event }: KenangCameraProps) {
  const {
    videoRef,
    previewCanvasRef,
    isLutReady,
    state,
    setState,
    flipCamera,
    flash,
    setFlash,
    isFlashFiring,
    selectedFilm,
    setSelectedFilm,
    shotsTaken,
    remaining,
    isRollFinished,
    lastError,
    startCamera,
    capture,
    uploadShot,
  } = useCamera({ eventCode: event.slug, shotLimit: event.shotLimit });

  // Film Collection tersedia buat guest mengikuti plan host (Blueprint v2.1
  // — LUT premium eksklusif Gunung Tujuh ke atas). Dihitung sekali per event
  // plan, bukan di-recompute tiap render.
  const availableFilms = useMemo(() => getFilmsForPlan(event.plan), [event.plan]);

  // Cover acara ditampilkan sekali di awal, sebelum apa pun terkait kamera
  // (termasuk request izin) terjadi — murni tampilan, tidak mempengaruhi
  // state machine di useCamera.
  const [showCover, setShowCover] = useState(true);

  // Guest wajib isi nama sekali sebelum masuk kamera (dan itu jugalah yang
  // memicu POST /join di baliknya — lihat komentar di GuestNameScreen).
  // Kalau device ini sudah pernah join event ini sebelumnya (nickname
  // kesimpan di localStorage), lewati layar ini supaya guest yang keluar-
  // masuk halaman nggak ditanya nama berkali-kali.
  const [hasJoined, setHasJoined] = useState(() => getStoredNickname(event.slug) !== null);

  // Auto-return to "ready" after a success/failed toast so the guest can
  // keep shooting without extra taps.
  useEffect(() => {
    if (state === "success") {
      const t = setTimeout(() => setState(isRollFinished ? "roll-finished" : "ready"), 1200);
      return () => clearTimeout(t);
    }
  }, [state, isRollFinished, setState]);

  const handleCapture = async () => {
    const blob = await capture();
    if (blob) await uploadShot(blob);
  };

  if (showCover) {
    return <EventCoverScreen event={event} onContinue={() => setShowCover(false)} />;
  }

  if (!hasJoined) {
    return (
      <GuestNameScreen
        eventTitle={event.title}
        eventSlug={event.slug}
        onJoined={() => setHasJoined(true)}
      />
    );
  }

  if (state === "permission") {
    return (
      <PermissionScreen
        eventTitle={event.title}
        errorMessage={lastError}
        onRequestPermission={startCamera}
      />
    );
  }

  if (state === "roll-finished") {
    return (
      <EndOfRoll
        shotsTaken={shotsTaken}
        eventSlug={event.slug}
        revealMode={event.revealMode}
        eventStatus={event.status}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
      {/* Top bar — letterbox hitam solid ala iPhone Camera, bukan ngambang
          di atas viewfinder. Kontrol duduk di sini. */}
      <div className="relative z-20 flex shrink-0 items-center justify-between px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <ExitButton onExit={() => history.back()} />
        <ShotCounter shotsTaken={shotsTaken} remaining={remaining} />
        <FlashToggle value={flash} onChange={setFlash} />
      </div>

      {/* Viewfinder — hanya bagian tengah ini yang menampilkan gambar,
          persis seperti area preview di Camera app bawaan iPhone. */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        {/* Sumber frame kamera — disembunyikan secara visual, tapi tetap perlu
            "playing" di DOM supaya video terus mengalir ke WebGL sebagai texture. */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Viewfinder yang benar-benar dilihat guest: hasil LUT WebGL live. */}
        <canvas ref={previewCanvasRef} className="h-full w-full object-cover" />

        {/* Screen-flash fallback (kamera depan / browser tanpa dukungan torch,
            mis. iOS Safari) — layar putih terang berkedip sesaat pas jepret. */}
        {isFlashFiring && (
          <div className="absolute inset-0 z-40 bg-white pointer-events-none" />
        )}

        {!isLutReady && state === "ready" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
            <div className="h-6 w-6 rounded-full border-2 border-neutral-white/30 border-t-neutral-white animate-spin" />
          </div>
        )}

        {state === "loading" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
            <div className="h-8 w-8 rounded-full border-2 border-neutral-white/30 border-t-neutral-white animate-spin" />
          </div>
        )}

        <UploadProgress state={state} errorMessage={lastError} onRetry={handleCapture} />
      </div>

      {/* Bottom bar — letterbox hitam solid, isinya film selector + shutter row,
          persis susunan mode-selector & shutter di Camera app iPhone. */}
      <div className="relative z-20 shrink-0 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3">
        <FilmSelector selected={selectedFilm} onSelect={setSelectedFilm} films={availableFilms} />
        <div className="mt-4 flex items-center justify-center gap-10">
          <div className="w-11" /> {/* spacer to balance the flip button */}
          <ShutterButton onCapture={handleCapture} disabled={state !== "ready"} />
          <CameraFlipButton onFlip={flipCamera} />
        </div>
      </div>
    </div>
  );
}
