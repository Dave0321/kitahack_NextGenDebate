"use client";

import { ChevronRight } from "lucide-react";
import type { DebateCard } from "@/lib/models/debate-card";
import type { LucideIcon } from "lucide-react";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { MessageSquare, Play } from "lucide-react";

// ─── Compact vertical card (used in column layout) ─────────────────────────
function DebateCardItemCompact({
  card,
  onTapThumbnail,
}: {
  card: DebateCard;
  onTapThumbnail: (card: DebateCard) => void;
}) {
  const sdgs = getSDGsByIds(card.sdgTags);
  const thumbnail = card.videoUrl ? getYouTubeThumbnail(card.videoUrl, "medium") : null;

  return (
    <button
      onClick={() => onTapThumbnail(card)}
      className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-secondary/60"
      aria-label={`View ${card.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-white/5 transition-all group-hover:ring-primary/30 group-hover:scale-105">
        {thumbnail ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={card.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-5 w-5 text-white drop-shadow-md" fill="currentColor" />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MessageSquare className="h-6 w-6 text-muted-foreground/25" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {card.title}
        </p>
        {/* SDG pills */}
        {sdgs.length > 0 && (
          <div className="flex gap-1">
            {sdgs.slice(0, 2).map((sdg) => (
              <span
                key={sdg.id}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: `${sdg.color}cc` }}
              >
                {sdg.shortName}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Section (supports column variant for side-by-side layout) ──────────────
interface CardSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  cards: DebateCard[];
  onTapThumbnail: (card: DebateCard) => void;
  /** @deprecated — all taps now open the modal */
  onTapTitle?: (card: DebateCard) => void;
  onExpandList: () => void;
  /** "column" = vertically stacked compact cards (for side-by-side grid) */
  variant?: "scroll" | "column";
  /** Max cards to show in column mode */
  maxCards?: number;
}

export function CardSection({
  title,
  icon: Icon,
  iconColor,
  cards,
  onTapThumbnail,
  onExpandList,
  variant = "scroll",
  maxCards = 4,
}: CardSectionProps) {
  if (cards.length === 0) return null;

  const displayCards = variant === "column" ? cards.slice(0, maxCards) : cards;

  return (
    <section className="flex flex-col gap-3">
      {/* Section Header */}
      <button
        onClick={onExpandList}
        className="group flex items-center gap-3 transition-colors"
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${iconColor}22`, outline: `1px solid ${iconColor}44` }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {title}
        </span>
        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </button>

      {/* Cards */}
      {variant === "column" ? (
        <div className="flex flex-col gap-0.5">
          {displayCards.map((card) => (
            <DebateCardItemCompact
              key={card.id}
              card={card}
              onTapThumbnail={onTapThumbnail}
            />
          ))}
          {cards.length > maxCards && (
            <button
              onClick={onExpandList}
              className="mt-1 rounded-lg py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors text-center hover:bg-secondary/60"
            >
              +{cards.length - maxCards} more → View all
            </button>
          )}
        </div>
      ) : (
        /* Horizontal scroll (fallback / mobile) */
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {displayCards.map((card) => (
            <div key={card.id} className="flex w-44 flex-shrink-0 flex-col gap-2 lg:w-52">
              <button
                onClick={() => onTapThumbnail(card)}
                className="group/btn relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-white/5 transition-all duration-300 hover:ring-primary/40 hover:scale-[1.03] hover:shadow-xl"
                aria-label={`View ${card.title}`}
              >
                {getYouTubeThumbnail(card.videoUrl ?? "", "medium") ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getYouTubeThumbnail(card.videoUrl ?? "", "medium")!}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/btn:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-secondary">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/25" />
                  </div>
                )}
                {getSDGsByIds(card.sdgTags).length > 0 && (
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {getSDGsByIds(card.sdgTags).map((sdg) => (
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
              <button
                onClick={() => onTapThumbnail(card)}
                className="text-left text-sm font-semibold leading-snug text-foreground hover:text-primary transition-colors line-clamp-2"
              >
                {card.title}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
