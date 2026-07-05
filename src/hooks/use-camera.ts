"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFilmById, type FilmId } from "@/lib/films";
import { getOrCreateDeviceId } from "@/lib/utils";
import type { CameraState } from "@/types";

interface UseCameraOptions {
  eventCode: string;
  shotLimit: number | null; // null = unlimited
}

/**
 * Encapsulates the full Kenang Camera flow (Volume 5):
 * Camera Permission → Camera Opens → Choose Film → Capture → Preview
 * → Upload → Memory Saved
 *
 * States mirror the blueprint exactly: permission, loading, ready,
 * capturing, uploading, success, failed, offline.
 */
export function useCamera({ eventCode, shotLimit }: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>("permission");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [flash, setFlash] = useState<"auto" | "on" | "off">("auto");
  const [selectedFilm, setSelectedFilm] = useState<FilmId>("sunny-roll");
  const [shotsTaken, setShotsTaken] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const remaining = shotLimit === null ? null : Math.max(shotLimit - shotsTaken, 0);
  const isRollFinished = remaining !== null && remaining <= 0;

  // Track connectivity — Volume 5 explicitly lists "Offline" as a state.
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setState("loading");
    setLastError(null);
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1920 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState(isRollFinished ? "roll-finished" : "ready");
    } catch (err) {
      console.error(err);
      setLastError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Izin kamera ditolak. Aktifkan akses kamera di pengaturan browser."
          : "Kamera tidak tersedia di perangkat ini."
      );
      setState("permission");
    }
  }, [facingMode, stopStream, isRollFinished]);

  const flipCamera = useCallback(() => {
    setFacingMode((m) => (m === "user" ? "environment" : "user"));
  }, []);

  useEffect(() => {
    // Restart the stream whenever facing mode changes, but only if we've
    // already been granted permission once (state isn't stuck on "permission").
    if (state !== "permission" && state !== "loading") {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => stopStream, [stopStream]);

  const applyFilmToCanvas = useCallback(
    (canvas: HTMLCanvasElement) => {
      const film = getFilmById(selectedFilm);
      const ctx = canvas.getContext("2d");
      if (!ctx || !videoRef.current) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Mirror the preview when using the front camera, matching what the
      // guest actually saw in the viewfinder.
      ctx.save();
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      // @ts-expect-error — ctx.filter is supported in all modern browsers
      ctx.filter = film.filter;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (film.grain > 0) {
        drawGrain(ctx, canvas.width, canvas.height, film.grain);
      }
      if (film.vignette) {
        drawVignette(ctx, canvas.width, canvas.height);
      }
    },
    [selectedFilm, facingMode]
  );

  const capture = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current || isRollFinished) return null;
    setState("capturing");

    // Camera sound + haptic feedback per Volume 5.
    if (navigator.vibrate) navigator.vibrate(35);

    const canvas = document.createElement("canvas");
    applyFilmToCanvas(canvas);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
    );

    setShotsTaken((n) => n + 1);
    setState(isOnline ? "uploading" : "offline");
    return blob;
  }, [applyFilmToCanvas, isRollFinished, isOnline]);

  const uploadShot = useCallback(
    async (blob: Blob) => {
      const deviceId = getOrCreateDeviceId();
      const form = new FormData();
      form.append("file", blob, `${Date.now()}.jpg`);
      form.append("eventCode", eventCode);
      form.append("filmType", selectedFilm);
      form.append("deviceId", deviceId);
      form.append(
        "orientation",
        window.innerWidth > window.innerHeight ? "landscape" : "portrait"
      );
      form.append("timestamp", new Date().toISOString());

      try {
        const res = await fetch("/api/v1/uploads", { method: "POST", body: form });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message ?? "Upload gagal");
        setState(isRollFinished ? "roll-finished" : "success");
        return true;
      } catch (err) {
        console.error(err);
        setLastError("Upload gagal. Foto akan dicoba ulang otomatis.");
        setState("failed");
        return false;
      }
    },
    [eventCode, selectedFilm, isRollFinished]
  );

  return {
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
    isOnline,
    lastError,
    startCamera,
    capture,
    uploadShot,
  };
}

function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 255 * intensity;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.35,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.7
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}
