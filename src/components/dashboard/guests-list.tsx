"use client";

import { useState } from "react";
import { Camera, ShieldOff, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GuestItem {
  id: string;
  nickname: string | null;
  deviceId: string;
  isBanned: boolean;
  joinedAt: string;
  _count: { photos: number };
}

interface GuestsListProps {
  initialGuests: GuestItem[];
}

export function GuestsList({ initialGuests }: GuestsListProps) {
  const [guests, setGuests] = useState(initialGuests);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const toggleBan = async (guest: GuestItem) => {
    const nextValue = !guest.isBanned;
    const confirmMessage = nextValue
      ? `Ban tamu ini? Mereka tidak akan bisa mengunggah foto lagi.`
      : `Batalkan ban tamu ini?`;
    if (!confirm(confirmMessage)) return;

    setPendingId(guest.id);
    setGuests((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, isBanned: nextValue } : g))
    );

    try {
      await fetch(`/api/v1/guests/${guest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: nextValue }),
      });
    } finally {
      setPendingId(null);
    }
  };

  if (guests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-slate p-16 text-center">
        <p className="font-body text-sm text-neutral-midnight/60">
          Belum ada tamu yang bergabung. Sebar QR event supaya tamu mulai scan.
        </p>
      </div>
    );
  }

  return (
    <Card className="divide-y divide-neutral-slate overflow-hidden">
      {guests.map((guest) => (
        <div
          key={guest.id}
          className="flex items-center justify-between gap-4 p-4 sm:p-5"
        >
          <div className="min-w-0">
            <p
              className={cn(
                "font-body text-sm font-medium truncate",
                guest.isBanned ? "text-neutral-midnight/40 line-through" : "text-neutral-midnight"
              )}
            >
              {guest.nickname || "Tamu Anonim"}
            </p>
            <p className="font-body text-xs text-neutral-midnight/50 mt-0.5">
              Bergabung{" "}
              {new Date(guest.joinedAt).toLocaleDateString("id-ID", {
                dateStyle: "medium",
              })}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1.5 font-body text-xs text-neutral-midnight/60">
              <Camera size={14} /> {guest._count.photos} foto
            </span>

            {guest.isBanned && (
              <span className="rounded-sm bg-crimson-50 px-2 py-0.5 font-body text-xs font-medium text-crimson">
                Dibanned
              </span>
            )}

            <Button
              variant={guest.isBanned ? "secondary" : "danger"}
              className="px-3 py-1.5 text-xs"
              disabled={pendingId === guest.id}
              onClick={() => toggleBan(guest)}
            >
              {guest.isBanned ? (
                <>
                  <ShieldCheck size={14} /> Batalkan Ban
                </>
              ) : (
                <>
                  <ShieldOff size={14} /> Ban
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
