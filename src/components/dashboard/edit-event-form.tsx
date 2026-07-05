"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEventSchema } from "@/lib/validation";
import { SHOT_COUNT_OPTIONS } from "@/lib/films";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { z } from "zod";

type EditEventForm = z.infer<typeof updateEventSchema>;

interface EditEventFormProps {
  eventId: string;
  defaultValues: {
    title: string;
    location: string | null;
    eventDate: string | null;
    revealMode: "INSTANT" | "AFTER_EVENT_ENDS";
    shotLimit: number | null;
    status: "DRAFT" | "LIVE" | "ENDED" | "ARCHIVED";
  };
}

export function EditEventForm({ eventId, defaultValues }: EditEventFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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
              {SHOT_COUNT_OPTIONS.map((n) => (
                <button
                  type="button"
                  key={n ?? "unlimited"}
                  onClick={() => setValue("shotLimit", n)}
                  className={`rounded-md px-3 py-1.5 text-sm font-body border transition-colors ${
                    shotLimit === n
                      ? "border-crimson bg-crimson-50 text-crimson"
                      : "border-neutral-slate text-neutral-midnight/70"
                  }`}
                >
                  {n ?? "Unlimited"}
                </button>
              ))}
            </div>
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
