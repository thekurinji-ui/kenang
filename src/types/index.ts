import type { FilmId } from "@/lib/films";

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
