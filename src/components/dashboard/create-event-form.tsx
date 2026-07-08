"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema } from "@/lib/validation";
import { EVENT_CATEGORIES } from "@/lib/event-categories";
import { getRollFilmPresets, getDefaultRollFilmOption, PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { z } from "zod";

type CreateEventForm = z.infer<typeof createEventSchema>;

interface CreateEventFormProps {
  /** Plan efektif user saat ini — menentukan opsi Roll Film mana yang boleh
   * dipilih (Kincai cuma 5, Kurinji 5/12/24/39, dst — lihat Blueprint v2.1). */
  plan: PlanId;
}

export function CreateEventForm({ plan }: CreateEventFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const { presets, allowCustom } = getRollFilmPresets(plan);
  const planConfig = PLAN_LIMITS[plan];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      revealMode: "INSTANT",
      category: "OTHER",
      shotLimit: getDefaultRollFilmOption(plan),
    },
  });

  const shotLimit = watch("shotLimit");

  const onSubmit = async (values: CreateEventForm) => {
    setServerError(null);
    const res = await fetch("/api/v1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      setServerError(json.message ?? "Gagal membuat event");
      return;
    }

    router.push(`/dashboard/events/${json.data.id}`);
  };

  return (
    <Card className="p-6 max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Judul Event"
          placeholder="Pernikahan Andi & Sari"
          {...register("title")}
          error={errors.title?.message}
        />
        <Input
          label="Lokasi"
          placeholder="Kerinci, Jambi"
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
              className="mt-1 w-40 rounded-md border border-neutral-slate bg-neutral-white px-3.5 py-2 font-body text-sm text-neutral-midnight"
              onChange={(e) => setValue("shotLimit", e.target.value ? Number(e.target.value) : null)}
            />
          )}
          {presets.length === 1 && !allowCustom && (
            <p className="font-body text-xs text-neutral-midnight/50">
              Paket {planConfig.name} kamu memakai jatah tetap {presets[0]} jepretan per tamu.{" "}
              <a href="/features#harga" className="text-crimson underline">
                Upgrade paket
              </a>{" "}
              untuk pilihan lebih banyak.
            </p>
          )}
        </div>

        {serverError && <p className="text-sm text-crimson">{serverError}</p>}

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Buat Event & Generate QR
        </Button>
      </form>
    </Card>
  );
}
