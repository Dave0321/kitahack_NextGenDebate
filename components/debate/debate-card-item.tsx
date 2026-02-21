"use client";

import type { DebateCard } from "@/lib/models/debate-card";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { MessageSquare, Play } from "lucide-react";

interface DebateCardItemProps {
  card: DebateCard;
  onTapThumbnail: (card: DebateCard) => void;
  onTapTitle: (card: DebateCard) => void;
}

export function DebateCardItem({
  card,
  onTapThumbnail,
  onTapTitle,
}: DebateCardItemProps) {
  const sdgs = getSDGsByIds(card.sdgTags);
  const thumbnail = card.videoUrl ? getYouTubeThumbnail(card.videoUrl, "medium") : null;

  return (
    <div className="group flex w-44 flex-shrink-0 flex-col gap-2.5 lg:w-52">
      {/* Thumbnail – tap opens Card View */}
      <button
        onClick={() => onTapThumbnail(card)}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-white/5 transition-all duration-300 hover:ring-primary/40 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View details for ${card.title}`}
      >
        {thumbnail ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={card.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <Play className="ml-0.5 h-4 w-4 text-black" fill="currentColor" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary">
            <MessageSquare className="h-8 w-8 text-muted-foreground/25 transition-colors group-hover:text-primary/40" />
          </div>
        )}

        {/* SDG tags overlay */}
        {sdgs.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {sdgs.map((sdg) => (
              <span
                key={sdg.id}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm"
                style={{ backgroundColor: `${sdg.color}cc` }}
              >
                {sdg.shortName}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Title – tap opens Dedicated Topic Page */}
      <button
        onClick={() => onTapTitle(card)}
        className="text-left text-sm font-semibold leading-snug text-foreground hover:text-primary transition-colors line-clamp-2"
      >
        {card.title}
      </button>

      {/* Snippet */}
      <button
        onClick={() => onTapThumbnail(card)}
        className="text-left text-xs leading-relaxed text-muted-foreground line-clamp-2 hover:text-muted-foreground/80 transition-colors"
      >
        {card.getSummary()}
      </button>
    </div>
  );
}
