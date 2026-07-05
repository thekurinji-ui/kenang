"use client";

import { Camera, Users, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getFilmById } from "@/lib/films";

export interface AnalyticsData {
  totalPhotos: number;
  totalGuests: number;
  storageUsed: number;
  timeline: { date: string; count: number }[];
  filmBreakdown: { filmType: string; count: number }[];
}

function formatStorage(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const maxTimelineCount = Math.max(1, ...data.timeline.map((t) => t.count));
  const maxFilmCount = Math.max(1, ...data.filmBreakdown.map((f) => f.count));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs font-body text-neutral-midnight/50 flex items-center gap-1.5">
            <Camera size={14} /> Total Foto
          </p>
          <p className="font-heading text-xl font-semibold mt-1">{data.totalPhotos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-body text-neutral-midnight/50 flex items-center gap-1.5">
            <Users size={14} /> Total Tamu
          </p>
          <p className="font-heading text-xl font-semibold mt-1">{data.totalGuests}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-body text-neutral-midnight/50 flex items-center gap-1.5">
            <HardDrive size={14} /> Storage
          </p>
          <p className="font-heading text-xl font-semibold mt-1">
            {formatStorage(data.storageUsed)}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-heading font-semibold text-neutral-midnight">Timeline Upload</h2>
        <p className="font-body text-xs text-neutral-midnight/50 mt-0.5">
          Jumlah foto yang diunggah tamu per hari.
        </p>

        {data.timeline.length === 0 ? (
          <p className="font-body text-sm text-neutral-midnight/50 py-10 text-center">
            Belum ada data upload.
          </p>
        ) : (
          <div className="mt-6 flex items-end gap-2 h-40 overflow-x-auto pb-1">
            {data.timeline.map((point) => (
              <div
                key={point.date}
                className="flex flex-col items-center gap-2 shrink-0 w-10"
                title={`${point.count} foto`}
              >
                <span className="font-body text-xs text-neutral-midnight/60">{point.count}</span>
                <div
                  className="w-full rounded-t-sm bg-crimson"
                  style={{
                    height: `${Math.max(4, (point.count / maxTimelineCount) * 96)}px`,
                  }}
                />
                <span className="font-body text-[10px] text-neutral-midnight/40 whitespace-nowrap">
                  {formatDateLabel(point.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-heading font-semibold text-neutral-midnight">Film Paling Populer</h2>
        <p className="font-body text-xs text-neutral-midnight/50 mt-0.5">
          Film yang paling sering dipakai tamu untuk memotret.
        </p>

        {data.filmBreakdown.length === 0 ? (
          <p className="font-body text-sm text-neutral-midnight/50 py-10 text-center">
            Belum ada data film.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {data.filmBreakdown.map((entry) => {
              const film = getFilmById(entry.filmType);
              return (
                <div key={entry.filmType} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: film.swatch }}
                    aria-hidden
                  />
                  <span className="font-body text-sm text-neutral-midnight/80 w-32 shrink-0 truncate">
                    {film.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-neutral-slate overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(entry.count / maxFilmCount) * 100}%`,
                        backgroundColor: film.swatch,
                      }}
                    />
                  </div>
                  <span className="font-body text-xs text-neutral-midnight/50 w-10 text-right shrink-0">
                    {entry.count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
