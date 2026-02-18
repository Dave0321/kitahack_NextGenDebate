"use client";

import type { DebateCard } from "@/lib/models/debate-card";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  Gamepad2,
  Video,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { YouTubePlayer } from "@/components/debate/youtube-player";

interface DedicatedTopicPageProps {
  card: DebateCard;
  onBack: () => void;
}

export function DedicatedTopicPage({ card, onBack }: DedicatedTopicPageProps) {
  const sdgs = getSDGsByIds(card.sdgTags);
  const [showNotAvailable, setShowNotAvailable] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4 lg:px-8">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-foreground truncate">
          {card.title}
        </h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
        {/* Large Thumbnail */}
        <div className="mb-6 flex aspect-video w-full items-center justify-center rounded-2xl bg-secondary">
          <MessageSquare className="h-20 w-20 text-muted-foreground/20" />
        </div>

        {/* Title */}
        <h2 className="mb-3 text-2xl font-bold text-foreground text-balance">
          {card.title}
        </h2>

        {/* Date */}
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(card.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>

        {/* SDG Tags */}
        {sdgs.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {sdgs.map((sdg) => (
              <span
                key={sdg.id}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: sdg.color }}
              >
                SDG {sdg.id}: {sdg.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-6 rounded-xl bg-card border p-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Description
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {card.description}
          </p>
        </div>

        {/* Video section */}
        {card.videoUrl && (
          <div className="mb-6 rounded-xl bg-card border p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
            </h3>
            <YouTubePlayer url={card.videoUrl} title={card.title} />
          </div>
        )}

        {/* Play Game Button */}
        {showNotAvailable ? (
          <div className="rounded-xl bg-secondary p-6 text-center">
            <p className="text-base font-medium text-muted-foreground">
              Not available yet
            </p>
          </div>
        ) : (
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowNotAvailable(true)}
          >
            <Gamepad2 className="h-5 w-5" />
            Play Game
          </Button>
        )}
      </div>
    </div>
  );
}
