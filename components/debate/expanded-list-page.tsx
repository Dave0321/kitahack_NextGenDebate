"use client";

import { useState, useMemo } from "react";
import type { DebateCard } from "@/lib/models/debate-card";
import { getSDGsByIds, SDG_GOALS } from "@/lib/data/sdg-data";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, MessageSquare, Search, X } from "lucide-react";

interface ExpandedListPageProps {
  title: string;
  cards: DebateCard[];
  onBack: () => void;
  onTapCard: (card: DebateCard) => void;
  onTapTitle: (card: DebateCard) => void;
}

export function ExpandedListPage({
  title,
  cards,
  onBack,
  onTapCard,
  onTapTitle,
}: ExpandedListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSdgFilter, setSelectedSdgFilter] = useState<number | null>(
    null
  );

  // Collect all unique SDG IDs present in cards
  const availableSdgs = useMemo(() => {
    const sdgIds = new Set<number>();
    cards.forEach((card) => card.sdgTags.forEach((id) => sdgIds.add(id)));
    return SDG_GOALS.filter((sdg) => sdgIds.has(sdg.id));
  }, [cards]);

  // Filter cards by search and SDG filter
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSdg =
        selectedSdgFilter === null ||
        card.sdgTags.includes(selectedSdgFilter);
      return matchesSearch && matchesSdg;
    });
  }, [cards, searchQuery, selectedSdgFilter]);

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
        <h1 className="text-base font-bold text-foreground">{title}</h1>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-4 lg:px-8">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* SDG Filter chips */}
        {availableSdgs.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setSelectedSdgFilter(null)}
              className={cn(
                "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedSdgFilter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              All
            </button>
            {availableSdgs.map((sdg) => (
              <button
                key={sdg.id}
                onClick={() =>
                  setSelectedSdgFilter(
                    selectedSdgFilter === sdg.id ? null : sdg.id
                  )
                }
                className={cn(
                  "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  selectedSdgFilter === sdg.id
                    ? "text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                style={
                  selectedSdgFilter === sdg.id
                    ? { backgroundColor: sdg.color }
                    : undefined
                }
              >
                {sdg.shortName}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="mb-3 text-xs text-muted-foreground">
          {filteredCards.length} result{filteredCards.length !== 1 ? "s" : ""}
          {searchQuery || selectedSdgFilter !== null ? " found" : ""}
        </p>

        {/* Grid of cards */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredCards.map((card) => {
              const sdgs = getSDGsByIds(card.sdgTags);
              return (
                <div
                  key={card.id}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => onTapCard(card)}
                    className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary"
                    aria-label={`View ${card.title}`}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                    {sdgs.length > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                        {sdgs.map((sdg) => (
                          <span
                            key={sdg.id}
                            className="rounded px-1 py-0.5 text-[9px] font-semibold text-white"
                            style={{ backgroundColor: sdg.color }}
                          >
                            {sdg.shortName}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => onTapTitle(card)}
                    className="text-left text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {card.title}
                  </button>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {card.getSummary()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No debates match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
