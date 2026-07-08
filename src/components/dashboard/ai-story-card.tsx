"use client";

import { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AiStoryCardProps {
  eventId: string;
  initialStory: string | null;
  initialGeneratedAt: string | null; // ISO string, sudah di-serialize dari server component
}

export function AiStoryCard({ eventId, initialStory, initialGeneratedAt }: AiStoryCardProps) {
  const [story, setStory] = useState(initialStory);
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message ?? "Gagal membuat AI Story.");
        return;
      }
      setStory(json.data.story);
      setGeneratedAt(new Date().toISOString());
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading font-semibold text-neutral-midnight flex items-center gap-1.5">
          <Sparkles size={16} className="text-crimson" /> AI Story
        </h2>
        <Button variant="secondary" onClick={generate} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Membuat...
            </>
          ) : story ? (
            "Buat Ulang"
          ) : (
            "Generate Story"
          )}
        </Button>
      </div>

      {error && <p className="font-body text-sm text-red-600">{error}</p>}

      {story ? (
        <>
          <p className="font-body text-sm text-neutral-midnight/80 leading-relaxed whitespace-pre-line">
            {story}
          </p>
          {generatedAt && (
            <p className="font-body text-xs text-neutral-midnight/40">
              Dibuat {new Date(generatedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
        </>
      ) : (
        !loading && (
          <p className="font-body text-sm text-neutral-midnight/50">
            Belum ada cerita. Klik &quot;Generate Story&quot; untuk membuat narasi otomatis dari momen-momen di event ini.
          </p>
        )
      )}
    </Card>
  );
}
