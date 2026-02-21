"use client";

import { useState, useMemo } from "react";
import type { DebateCard } from "@/lib/models/debate-card";
import { getSDGsByIds, SDG_GOALS } from "@/lib/data/sdg-data";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { CardViewModal } from "@/components/debate/card-view-modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, MessageSquare, Search, X, Play } from "lucide-react";

interface ExpandedListPageProps {
  title: string;
  cards: DebateCard[];
  onBack: () => void;
  /** @deprecated kept for backward-compat — all taps now open the modal */
  onTapCard?: (card: DebateCard) => void;
  /** @deprecated kept for backward-compat */
  onTapTitle?: (card: DebateCard) => void;
}

export function ExpandedListPage({
  title,
  cards,
  onBack,
}: ExpandedListPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSdgFilter, setSelectedSdgFilter] = useState<number | null>(null);

  // AI analysis modal state — lives here so it works without the parent
  const [modalCard, setModalCard] = useState<DebateCard | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (card: DebateCard) => {
    setModalCard(card);
    setModalOpen(true);
  };

  // Unique SDG IDs across all cards
  const availableSdgs = useMemo(() => {
    const sdgIds = new Set<number>();
    cards.forEach((card) => card.sdgTags.forEach((id) => sdgIds.add(id)));
    return SDG_GOALS.filter((sdg) => sdgIds.has(sdg.id));
  }, [cards]);

  // Filter by search + SDG
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
    <>
      <div className="min-h-screen bg-background">
        {/* Sticky header */}
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
          {/* Search */}
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

          {/* SDG filter chips */}
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
                    setSelectedSdgFilter(selectedSdgFilter === sdg.id ? null : sdg.id)
                  }
                  className={cn(
                    "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    selectedSdgFilter === sdg.id
                      ? "text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                  style={selectedSdgFilter === sdg.id ? { backgroundColor: sdg.color } : undefined}
                >
                  {sdg.shortName}
                </button>
              ))}
            </div>
          )}

          {/* Count */}
          <p className="mb-3 text-xs text-muted-foreground">
            {filteredCards.length} result{filteredCards.length !== 1 ? "s" : ""}
            {searchQuery || selectedSdgFilter !== null ? " found" : ""}
          </p>

          {/* Grid */}
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredCards.map((card) => {
                const sdgs = getSDGsByIds(card.sdgTags);
                const thumbnail = card.videoUrl
                  ? getYouTubeThumbnail(card.videoUrl, "medium")
                  : null;
                return (
                  <button
                    key={card.id}
                    onClick={() => openModal(card)}
                    className="group flex flex-col gap-2 rounded-xl border bg-card p-3 text-left transition-all hover:shadow-md hover:border-primary/30"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary">
                      {thumbnail ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbnail}
                            alt={card.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg">
                              <Play className="ml-0.5 h-4 w-4 text-black" fill="currentColor" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                        </div>
                      )}

                      {/* SDG overlay */}
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
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {card.title}
                    </p>

                    {/* Summary */}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {card.getSummary()}
                    </p>
                  </button>
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

      {/* AI analysis modal — self-contained inside this page */}
      <CardViewModal
        card={modalCard}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
