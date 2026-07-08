"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEventSchema } from "@/lib/validation";
import { EVENT_CATEGORIES, type EventCategoryId } from "@/lib/event-categories";
import { getRollFilmPresets, PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { z } from "zod";

type EditEventForm = z.infer<typeof updateEventSchema>;

interface EditEventFormProps {
  eventId: string;
  /** Plan SNAPSHOT event ini (bukan plan langganan user saat ini) — event
   * yang sudah dibuat tetap terkunci ke opsi Roll Film plan pada saat ia
   * dibuat, sesuai catatan di prisma/schema.prisma. */
  plan: PlanId;
  defaultValues: {
    title: string;
    location: string | null;
    eventDate: string | null;
    revealMode: "INSTANT" | "AFTER_EVENT_ENDS";
    category: EventCategoryId;
    shotLimit: number | null;
    status: "DRAFT" | "LIVE" | "ENDED" | "ARCHIVED";
  };
}

export function EditEventForm({ eventId, plan, defaultValues }: EditEventFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { presets, allowCustom } = getRollFilmPresets(plan);
  const planConfig = PLAN_LIMITS[plan];
  // Roll film mode "Custom" harus dinyalakan dari awal kalau nilai
  // shotLimit event ini bukan salah satu preset baku (mis. di-set manual
  // lewat admin panel) — supaya tidak "hilang" begitu form dibuka.
  const [customMode, setCustomMode] = useState(
    defaultValues.shotLimit !== null && !presets.includes(defaultValues.shotLimit)
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditEventForm>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: defaultValues.title,
      location: defaultValues.location ?? undefined,
      eventDate: defaultValues.eventDate ?? undefined,
      revealMode: defaultValues.revealMode,
      category: defaultValues.category,
      shotLimit: defaultValues.shotLimit,
      status: defaultValues.status,
    },
  });

  const shotLimit = watch("shotLimit");
  const status = watch("status");

  const onSubmit = async (values: EditEventForm) => {
    setServerError(null);
    const res = await fetch(`/api/v1/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      setServerError(json.message ?? "Gagal menyimpan perubahan");
      return;
    }

    router.push(`/dashboard/events/${eventId}`);
    router.refresh();
  };

  const onDelete = async () => {
    if (!confirm("Yakin hapus event ini? Event akan diarsipkan dan tidak bisa diakses tamu lagi.")) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/v1/events/${eventId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setServerError(json.message ?? "Gagal menghapus event");
      setDeleting(false);
      return;
    }
    router.push("/dashboard/events");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Judul Event"
            {...register("title")}
            error={errors.title?.message}
          />
          <Input
            label="Lokasi"
            {...register("location")}
            error={errors.location?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-neutral-midnight">
              Jenis Acara
            </label>
            <select
              {...register("category")}
              className="rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2.5 font-body text-sm text-neutral-midnight"
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Tanggal Acara"
            type="date"
            {...register("eventDate")}
            error={errors.eventDate?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-neutral-midnight">
              Status Event
            </label>
            <select
              {...register("status")}
              className="rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2.5 font-body text-sm text-neutral-midnight"
            >
              <option value="DRAFT">Draft</option>
              <option value="LIVE">Live</option>
              <option value="ENDED">Selesai</option>
              <option value="ARCHIVED">Diarsipkan</option>
            </select>
            <p className="font-body text-xs text-neutral-midnight/50">
              Status saat ini: {status}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-neutral-midnight">
              Reveal Mode
            </label>
            <select
              {...register("revealMode")}
              className="rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2.5 font-body text-sm text-neutral-midnight"
            >
              <option value="INSTANT">Instant — tamu langsung lihat hasil</option>
              <option value="AFTER_EVENT_ENDS">Setelah acara selesai</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-neutral-midnight">
              Batas Jepretan per Tamu
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((n) => (
                <button
                  type="button"
                  key={n ?? "unlimited"}
                  onClick={() => {
                    setCustomMode(false);
                    setValue("shotLimit", n);
                  }}
                  className={`rounded-md px-3 py-1.5 text-sm font-body border transition-colors ${
                    !customMode && shotLimit === n
                      ? "border-crimson bg-crimson-50 text-crimson"
                      : "border-neutral-slate text-neutral-midnight/70"
                  }`}
                >
                  {n ?? "Unlimited"}
                </button>
              ))}
              {allowCustom && (
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className={`rounded-md px-3 py-1.5 text-sm font-body border transition-colors ${
                    customMode
                      ? "border-crimson bg-crimson-50 text-crimson"
                      : "border-neutral-slate text-neutral-midnight/70"
                  }`}
                >
                  Custom
                </button>
              )}
            </div>
            {customMode && (
              <input
                type="number"
                min={1}
                placeholder="Jumlah jepretan"
                defaultValue={shotLimit ?? undefined}
                className="mt-1 w-40 rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2 font-body text-sm text-neutral-midnight"
                onChange={(e) =>
                  setValue("shotLimit", e.target.value ? Number(e.target.value) : null)
                }
              />
            )}
            {presets.length === 1 && !allowCustom && (
              <p className="font-body text-xs text-neutral-midnight/50">
                Event ini dibuat dengan paket {planConfig.name}, jatahnya tetap{" "}
                {presets[0]} jepretan per tamu dan tidak bisa diubah di paket ini.
              </p>
            )}
          </div>

          {serverError && <p className="text-sm text-crimson">{serverError}</p>}

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Simpan Perubahan
          </Button>
        </form>
      </Card>

      <Card className="p-6 max-w-xl border-crimson/30">
        <h2 className="font-heading font-semibold text-neutral-midnight">Zona Berbahaya</h2>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1 mb-4">
          Menghapus event akan mengarsipkannya secara permanen dan tamu tidak bisa lagi
          mengunggah foto.
        </p>
        <Button variant="danger" onClick={onDelete} isLoading={deleting}>
          Hapus Event
        </Button>
      </Card>
    </div>
  );
}
