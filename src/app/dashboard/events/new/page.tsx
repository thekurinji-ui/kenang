import { CreateEventForm } from "@/components/dashboard/create-event-form";

export default function NewEventPage() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-neutral-midnight">Buat Event</h1>
        <p className="font-body text-sm text-neutral-midnight/60 mt-1">
          Waktu membuat event kurang dari 1 menit — QR langsung tersedia setelah disimpan.
        </p>
      </div>
      <CreateEventForm />
    </div>
  );
}
