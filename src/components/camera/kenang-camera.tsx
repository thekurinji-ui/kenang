"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/use-camera";
import { ShutterButton } from "./shutter-button";
import { FilmSelector } from "./film-selector";
import { FlashToggle, CameraFlipButton, ExitButton, ShotCounter } from "./camera-controls";
import { PermissionScreen } from "./permission-screen";
import { EndOfRoll } from "./end-of-roll";
import { UploadProgress } from "./upload-progress";
import { getFilmById } from "@/lib/films";
import type { PublicEventInfo } from "@/types";

interface KenangCameraProps {
  event: PublicEventInfo;
}

export function KenangCamera({ event }: KenangCameraProps) {
  const {
    videoRef,
    state,
    setState,
    facingMode,
    flipCamera,
    flash,
    setFlash,
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

  const film = getFilmById(selectedFilm);

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
    return <EndOfRoll shotsTaken={shotsTaken} />;
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{
          filter: film.filter,
          transform: facingMode === "user" ? "scaleX(-1)" : undefined,
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 z-20">
        <ExitButton onExit={() => history.back()} />
        <ShotCounter shotsTaken={shotsTaken} remaining={remaining} />
        <FlashToggle value={flash} onChange={setFlash} />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 inset-x-0 z-20 pb-8 pt-4 bg-gradient-to-t from-black/70 to-transparent">
        <FilmSelector selected={selectedFilm} onSelect={setSelectedFilm} />
        <div className="flex items-center justify-center gap-10 mt-4">
          <div className="w-11" /> {/* spacer to balance the flip button */}
          <ShutterButton onCapture={handleCapture} disabled={state !== "ready"} />
          <CameraFlipButton onFlip={flipCamera} />
        </div>
      </div>

      <UploadProgress state={state} errorMessage={lastError} onRetry={handleCapture} />

      {state === "loading" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <div className="h-8 w-8 rounded-full border-2 border-neutral-white/30 border-t-neutral-white animate-spin" />
        </div>
      )}
    </div>
  );
}
