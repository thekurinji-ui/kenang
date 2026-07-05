"use client";

import { useState } from "react";
import { Download, Share2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QrCardProps {
  eventId: string;
  eventTitle: string;
  initialImage: string;
  initialUrl: string;
}

export function QrCard({ eventId, eventTitle, initialImage, initialUrl }: QrCardProps) {
  const [image, setImage] = useState(initialImage);
  const [url, setUrl] = useState(initialUrl);
  const [regenerating, setRegenerating] = useState(false);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = image;
    a.download = `qr-${eventTitle.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: eventTitle, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link disalin ke clipboard");
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/v1/events/${eventId}/qr`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setImage(json.data.image);
        setUrl(json.data.url);
      }
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={`QR code untuk ${eventTitle}`} className="w-48 h-48 rounded-md" />
      <p className="font-mono text-xs text-neutral-midnight/60 break-all text-center">{url}</p>
      <div className="flex gap-2 w-full">
        <Button variant="secondary" className="flex-1" onClick={handleDownload}>
          <Download size={16} /> Unduh
        </Button>
        <Button variant="secondary" className="flex-1" onClick={handleShare}>
          <Share2 size={16} /> Bagikan
        </Button>
      </div>
      <Button variant="ghost" isLoading={regenerating} onClick={handleRegenerate} className="text-xs">
        <RefreshCw size={14} /> Regenerasi QR
      </Button>
    </Card>
  );
}
