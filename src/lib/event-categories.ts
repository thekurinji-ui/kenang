// Daftar jenis acara — dipakai di form Buat Event & Edit Event supaya host
// bisa memberi konteks acara (murni informatif, tidak mempengaruhi plan atau
// limit apa pun). Urutan di sini menentukan urutan tampil di dropdown.

export const EVENT_CATEGORIES = [
  { value: "WEDDING", label: "Pernikahan" },
  { value: "ENGAGEMENT", label: "Lamaran" },
  { value: "BIRTHDAY", label: "Ulang Tahun" },
  { value: "GRADUATION", label: "Wisuda" },
  { value: "CORPORATE_GATHERING", label: "Gathering Perusahaan" },
  { value: "REUNION", label: "Reuni" },
  { value: "FESTIVAL_CONCERT", label: "Festival atau Konser" },
  { value: "GRAND_OPENING", label: "Grand Opening" },
  { value: "BABY_SHOWER", label: "Baby Shower" },
  { value: "COMMUNITY_EVENT", label: "Acara Komunitas" },
  { value: "OTHER", label: "Lainnya" },
] as const;

export type EventCategoryId = (typeof EVENT_CATEGORIES)[number]["value"];

export function getEventCategoryLabel(value: string): string {
  return EVENT_CATEGORIES.find((c) => c.value === value)?.label ?? "Lainnya";
}
