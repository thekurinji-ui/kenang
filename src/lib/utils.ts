import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a public R2 URL from a storage key for use in <img src>.
 *  NEXT_PUBLIC_R2_PUBLIC_URL must be set (see .env.example) — this runs
 *  client-side in gallery/viewer components. */
export function photoUrl(key: string) {
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  return `${base}/${key}`;
}

/** Generate a stable per-browser device id, persisted in localStorage.
 *  Used so guests don't need to log in (per PRD: "Guest tidak wajib login"). */
export function getOrCreateDeviceId(): string {
  const key = "kenang_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/** Nama yang sudah diisi tamu untuk event tertentu, disimpan per-eventCode
 *  (bukan satu key global) supaya tamu yang sama tetap ditanya nama lagi
 *  kalau ikut event lain — tapi tidak ditanya ulang kalau buka event yang
 *  sama dua kali (mis. sempat keluar/reload halaman). */
export function getStoredNickname(eventCode: string): string | null {
  return localStorage.getItem(`kenang_nickname:${eventCode}`);
}

export function setStoredNickname(eventCode: string, nickname: string): void {
  localStorage.setItem(`kenang_nickname:${eventCode}`, nickname);
}
