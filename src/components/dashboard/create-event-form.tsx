"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema } from "@/lib/validation";
import { SHOT_COUNT_OPTIONS } from "@/lib/films";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { z } from "zod";

type CreateEventForm = z.infer<typeof createEventSchema>;

export function CreateEventForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { revealMode: "INSTANT", shotLimit: 24 },
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
          Buat Event & Generate QR
        </Button>
      </form>
    </Card>
  );
}
