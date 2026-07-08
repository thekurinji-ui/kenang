import type { FilmId } from "@/lib/films";
import type { PlanId } from "@/lib/plans";

export type CameraState =
  | "permission"
  | "loading"
  | "ready"
  | "capturing"
  | "uploading"
  | "success"
  | "failed"
  | "offline"
  | "roll-finished";

export interface PublicEventInfo {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  eventDate: string | null;
  location: string | null;
  status: "DRAFT" | "LIVE" | "ENDED" | "ARCHIVED";
  revealMode: "INSTANT" | "AFTER_EVENT_ENDS";
  shotLimit: number | null;
  /** Plan pemilik event (snapshot saat event dibuat) — menentukan Film
   * Collection mana yang tersedia buat guest, lihat `getFilmsForPlan`. */
  plan: PlanId;
  /** Jenis acara (mis. "WEDDING", "BIRTHDAY") — murni informatif, ditampilkan
   * di cover screen. Lihat label-nya lewat `getEventCategoryLabel`. */
  category: string;
}

export interface CapturedShot {
  id: string;
  blob: Blob;
  previewUrl: string;
  film: FilmId;
  capturedAt: string;
  uploadStatus: "pending" | "uploading" | "done" | "failed";
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
}
