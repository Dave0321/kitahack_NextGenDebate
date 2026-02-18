"use client";

import { Plus, ChevronRight } from "lucide-react";
import type { DebateCard } from "@/lib/models/debate-card";
import { DebateCardItem } from "./debate-card-item";

interface CardSectionProps {
  title: string;
  cards: DebateCard[];
  onTapThumbnail: (card: DebateCard) => void;
  onTapTitle: (card: DebateCard) => void;
  onAdd: () => void;
  onExpandList: () => void;
}

export function CardSection({
  title,
  cards,
  onTapThumbnail,
  onTapTitle,
  onAdd,
  onExpandList,
}: CardSectionProps) {
  if (cards.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 lg:px-8">
        <button
          onClick={onExpandList}
          className="flex items-center gap-1 text-base font-bold text-foreground hover:text-primary transition-colors"
        >
          {title}
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={onAdd}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          aria-label={`Create new card in ${title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar lg:px-8">
        {cards.map((card) => (
          <DebateCardItem
            key={card.id}
            card={card}
            onTapThumbnail={onTapThumbnail}
            onTapTitle={onTapTitle}
          />
        ))}
      </div>
    </section>
  );
}
