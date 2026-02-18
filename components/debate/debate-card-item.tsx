"use client";

import type { DebateCard } from "@/lib/models/debate-card";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { MessageSquare } from "lucide-react";

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

  return (
    <div className="flex w-44 flex-shrink-0 flex-col gap-2 lg:w-56">
      {/* Thumbnail - tap opens Card View */}
      <button
        onClick={() => onTapThumbnail(card)}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View details for ${card.title}`}
      >
        <div className="flex h-full w-full items-center justify-center bg-secondary">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40 transition-colors group-hover:text-primary/60" />
        </div>
        {/* SDG tags overlay */}
        {sdgs.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {sdgs.map((sdg) => (
              <span
                key={sdg.id}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: sdg.color }}
              >
                {sdg.shortName}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Title - tap opens Dedicated Topic Page */}
      <button
        onClick={() => onTapTitle(card)}
        className="text-left text-sm font-semibold leading-tight text-foreground hover:text-primary transition-colors line-clamp-2"
      >
        {card.title}
      </button>

      {/* Description snippet - tap opens Card View */}
      <button
        onClick={() => onTapThumbnail(card)}
        className="text-left text-xs leading-relaxed text-muted-foreground line-clamp-2"
      >
        {card.getSummary()}
      </button>
    </div>
  );
}
