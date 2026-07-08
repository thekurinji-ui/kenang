"use client";

import { useState } from "react";
import { Download, Share2, RefreshCw, FileImage } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateQrCardBlob, downloadBlob, type QrCardFormat } from "@/lib/qr-card";

interface QrCardProps {
  eventId: string;
  eventTitle: string;
  eventDateLabel?: string | null;
  eventLocation?: string | null;
  initialImage: string;
  initialUrl: string;
}

export function QrCard({
  eventId,
  eventTitle,
  eventDateLabel = null,
  eventLocation = null,
  initialImage,
  initialUrl,
}: QrCardProps) {
  const [image, setImage] = useState(initialImage);
  const [url, setUrl] = useState(initialUrl);
  const [regenerating, setRegenerating] = useState(false);
  const [generatingFormat, setGeneratingFormat] = useState<QrCardFormat | null>(null);

  const slug = eventTitle.toLowerCase().trim().replace(/\s+/g, "-");

  const handleDownloadCard = async (format: QrCardFormat) => {
    setGeneratingFormat(format);
    try {
      const blob = await generateQrCardBlob(format, {
        eventTitle,
        eventDateLabel,
        eventLocation,
        qrImageSrc: image,
      });
      const suffix = format === "a4" ? "poster-a4" : "story-ig";
      downloadBlob(blob, `kartu-qr-${suffix}-${slug}.png`);
    } catch {
      alert("Gagal membuat kartu QR. Coba lagi ya.");
    } finally {
      setGeneratingFormat(null);
    }
  };

  const handleDownloadRaw = () => {
    const a = document.createElement("a");
    a.href = image;
    a.download = `qr-polos-${slug}.png`;
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

      <div className="w-full">
        <p className="font-body text-xs font-medium text-neutral-midnight/50 mb-2 text-center">
          Unduh kartu QR siap pakai — sudah termasuk desain, tinggal cetak atau share
        </p>
        <div className="flex gap-2 w-full">
          <Button
            variant="primary"
            className="flex-1"
            isLoading={generatingFormat === "a4"}
            disabled={generatingFormat !== null}
            onClick={() => handleDownloadCard("a4")}
          >
            <FileImage size={16} /> Poster A4
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            isLoading={generatingFormat === "story"}
            disabled={generatingFormat !== null}
            onClick={() => handleDownloadCard("story")}
          >
            <FileImage size={16} /> Story IG
          </Button>
        </div>
      </div>

      <div className="flex gap-2 w-full">
        <Button variant="secondary" className="flex-1" onClick={handleDownloadRaw}>
          <Download size={16} /> QR Polos
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
