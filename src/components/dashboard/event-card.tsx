import Link from "next/link";
import { Camera, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getEventCategoryLabel } from "@/lib/event-categories";

interface EventCardProps {
  id: string;
  title: string;
  location: string | null;
  eventDate: string | null;
  status: "DRAFT" | "LIVE" | "ENDED" | "ARCHIVED";
  category: string;
  totalPhotos: number;
  totalGuests: number;
}

const STATUS_STYLES: Record<EventCardProps["status"], string> = {
  DRAFT: "bg-neutral-slate text-neutral-midnight/70",
  LIVE: "bg-crimson-50 text-crimson",
  ENDED: "bg-royal-50 text-royal",
  ARCHIVED: "bg-neutral-slate text-neutral-midnight/50",
};

const STATUS_LABEL: Record<EventCardProps["status"], string> = {
  DRAFT: "Draft",
  LIVE: "Live",
  ENDED: "Berakhir",
  ARCHIVED: "Diarsipkan",
};

export function EventCard({
  id,
  title,
  location,
  eventDate,
  status,
  category,
  totalPhotos,
  totalGuests,
}: EventCardProps) {
  return (
    <Link href={`/dashboard/events/${id}`}>
      <Card className="p-5 hover:shadow-medium transition-shadow h-full flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold text-neutral-midnight leading-snug">
            {title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium font-body",
              STATUS_STYLES[status]
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>

        <span className="w-fit rounded-full border border-neutral-slate px-2.5 py-0.5 font-body text-xs text-neutral-midnight/60">
          {getEventCategoryLabel(category)}
        </span>

        <div className="space-y-1 text-sm text-neutral-midnight/60 font-body">
          {location && (
            <p className="flex items-center gap-1.5">
              <MapPin size={14} /> {location}
            </p>
          )}
          {eventDate && (
            <p>{new Date(eventDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-auto pt-2 text-xs text-neutral-midnight/50 font-body">
          <span className="flex items-center gap-1">
            <Camera size={14} /> {totalPhotos} foto
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {totalGuests} tamu
          </span>
        </div>
      </Card>
    </Link>
  );
}
