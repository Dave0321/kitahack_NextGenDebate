"use client";

import type { DebateCard } from "@/lib/models/debate-card";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MessageSquare, Gamepad2, Video } from "lucide-react";
import { useState } from "react";
import { YouTubePlayer } from "@/components/debate/youtube-player";

interface CardViewModalProps {
  card: DebateCard | null;
  open: boolean;
  onClose: () => void;
}

export function CardViewModal({ card, open, onClose }: CardViewModalProps) {
  const [showNotAvailable, setShowNotAvailable] = useState(false);

  if (!card) return null;

  const sdgs = getSDGsByIds(card.sdgTags);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{card.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Card view for {card.title}
          </DialogDescription>
        </DialogHeader>

        {/* Thumbnail */}
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-secondary">
          <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
        </div>

        {/* SDG Tags */}
        {sdgs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sdgs.map((sdg) => (
              <span
                key={sdg.id}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: sdg.color }}
              >
                SDG {sdg.id}: {sdg.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>

        {/* YouTube Video */}
        {card.videoUrl && (
          <div className="rounded-xl bg-secondary/50 p-3">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
              <Video className="h-3.5 w-3.5" />
              Video
            </h4>
            <YouTubePlayer url={card.videoUrl} title={card.title} />
          </div>
        )}

        {/* Play Game Button */}
        {showNotAvailable ? (
          <div className="rounded-lg bg-secondary p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Not available yet
            </p>
          </div>
        ) : (
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowNotAvailable(true)}
          >
            <Gamepad2 className="h-4 w-4" />
            Play Game
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
