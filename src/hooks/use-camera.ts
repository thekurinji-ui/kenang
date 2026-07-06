"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFilmById, type FilmId } from "@/lib/films";
import { getOrCreateDeviceId } from "@/lib/utils";
import { createLutRenderer, loadLutImage, type LutRenderer } from "@/lib/webgl-lut";
import type { CameraState } from "@/types";

// Cache antar-render supaya LUT yang sudah dimuat sekali tidak di-fetch ulang
// tiap kali guest gonta-ganti film di viewfinder.
const lutImageCache = new Map<string, Promise<HTMLImageElement>>();

function getCachedLutImage(url: string): Promise<HTMLImageElement> {
  let cached = lutImageCache.get(url);
  if (!cached) {
    cached = loadLutImage(url);
    lutImageCache.set(url, cached);
  }
  return cached;
}

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

  // Canvas yang menampilkan hasil live preview dengan LUT sudah diterapkan
  // (menggantikan pendekatan lama: <video style={{ filter: cssString }} />).
  //
  // PENTING: canvas ini baru masuk DOM setelah state berpindah dari
  // "permission" (lihat kenang-camera.tsx), jadi renderer TIDAK BOLEH dibuat
  // lewat useEffect([]) biasa — itu akan jalan duluan sebelum canvas ada dan
  // tidak pernah dicoba lagi (inilah penyebab layar hitam). Callback ref di
  // bawah dipanggil React persis saat elemen canvas mount/unmount, kapan pun itu terjadi.
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const lutRendererRef = useRef<LutRenderer | null>(null);
  const [isLutReady, setIsLutReady] = useState(false);
  const [rendererVersion, setRendererVersion] = useState(0);

  const previewCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasElRef.current = node;
    lutRendererRef.current?.destroy();
    lutRendererRef.current = null;
    if (node) {
      try {
        lutRendererRef.current = createLutRenderer(node);
        setRendererVersion((v) => v + 1); // trigger (re)load LUT di effect bawah
      } catch (err) {
        console.error("Gagal membuat LUT renderer:", err);
      }
    }
  }, []);

  const [state, setState] = useState<CameraState>("permission");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [flash, setFlash] = useState<"auto" | "on" | "off">("auto");
  const [selectedFilm, setSelectedFilm] = useState<FilmId>("snap-01");
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
          // Cuma batasi lebar sebagai plafon resolusi — JANGAN set height
          // ideal yang sama besar. Kalau width & height ideal dipaksa sama
          // (persegi), banyak device (terutama Android) memenuhinya dengan
          // digital crop/zoom ke tengah, jadi field-of-view kelihatan lebih
          // sempit ("ngezoom") dibanding preview kamera bawaan HP.
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

  // Muat ulang LUT setiap kali guest ganti film DI viewfinder, ATAU setiap
  // kali renderer baru saja dibuat (canvas baru mount / remount).
  useEffect(() => {
    if (!lutRendererRef.current) return;
    let cancelled = false;
    setIsLutReady(false);
    const film = getFilmById(selectedFilm);
    getCachedLutImage(film.lutUrl)
      .then((image) => {
        if (cancelled) return;
        lutRendererRef.current?.setLut(image, film.lutSize);
        setIsLutReady(true);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedFilm, rendererVersion]);

  // Loop render live preview: menggambar frame video terbaru ke canvas
  // dengan LUT aktif diterapkan, setiap frame (requestAnimationFrame).
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (videoRef.current && lutRendererRef.current) {
        lutRendererRef.current.draw(videoRef.current, facingMode === "user");
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [facingMode]);

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
      const source = canvasElRef.current;
      if (!ctx || !source || source.width === 0 || source.height === 0) return;

      // `source` (preview canvas) sudah berisi frame ter-mirror + LUT
      // diterapkan lewat WebGL, jadi hasil capture otomatis konsisten
      // 1:1 dengan apa yang dilihat guest di viewfinder.
      canvas.width = source.width;
      canvas.height = source.height;
      ctx.drawImage(source, 0, 0);

      if (film.grain > 0) {
        drawGrain(ctx, canvas.width, canvas.height, film.grain);
      }
      if (film.vignette) {
        drawVignette(ctx, canvas.width, canvas.height);
      }
    },
    [selectedFilm]
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
    previewCanvasRef,
    isLutReady,
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
