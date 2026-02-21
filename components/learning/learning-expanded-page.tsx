"use client";

import { useState, useMemo } from "react";
import type { LearningCard } from "@/lib/models/learning-card";
import { getSDGById } from "@/lib/data/sdg-data";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Search,
  X,
  BookOpen,
} from "lucide-react";
import { LearningCardItem } from "@/components/pages/learning-hub-page";
import { LearningDetailModal } from "./learning-detail-modal";

interface LearningExpandedPageProps {
  title: string;
  cards: LearningCard[];
  onBack: () => void;
  onCardClick: (card: LearningCard) => void;
}

const CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "logical-fallacy", label: "Fallacies" },
  { id: "sdg", label: "SDG" },
  { id: "general-lesson", label: "General" },
] as const;

function getSectionColor(category: string): string {
  switch (category) {
    case "logical-fallacy":
      return "#8b5cf6"; // violet-500
    case "sdg":
      return "#0ea5e9"; // sky-500
    case "general-lesson":
      return "#10b981"; // emerald-500
    default:
      return "#64748b"; // slate-500
  }
}

export function LearningExpandedPage({
  title,
  cards,
  onBack,
  onCardClick,
}: LearningExpandedPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [selectedCard, setSelectedCard] = useState<LearningCard | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleCardClick = (card: LearningCard) => {
    setSelectedCard(card);
    setDetailOpen(true);
  };

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || card.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [cards, searchQuery, selectedCategory]);

  // Check which categories are actually present
  const availableCategories = useMemo(() => {
    const cats = new Set(cards.map((c) => c.category));
    return CATEGORY_FILTERS.filter(
      (f) => f.id === "all" || cats.has(f.id as LearningCard["category"])
    );
  }, [cards]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden border-b border-foreground/5 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 px-4 py-12 lg:px-10 dark:from-[#0e0e1f] dark:via-[#12102a] dark:to-[#0a0a18] dark:border-white/5">
        <div className="pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl dark:opacity-50" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-sky-600/20 blur-3xl dark:opacity-50" />

        <div className="relative mx-auto max-w-7xl">
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors w-fit backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/30">
              <BookOpen className="h-5 w-5 text-violet-300" />
            </div>
            <h1 className="text-3xl font-black text-white lg:text-5xl leading-tight">
              {title}
            </h1>
          </div>
          <p className="text-base text-white/70 max-w-xl">
            Explore our curated collection of resources designed to improve your critical thinking and deepen your understanding.
          </p>
        </div>
      </div>

      {/* Sticky Filter & Search Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md px-4 py-4 lg:px-10 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* Category filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar flex-1">
            {availableCategories.length > 2 && availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                  selectedCategory === cat.id
                    ? "bg-foreground text-background shadow-md"
                    : "bg-foreground/5 border border-foreground/10 text-foreground hover:bg-foreground/10"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 rounded-xl bg-card border-foreground/10 focus-visible:ring-primary/20 shadow-sm"
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
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {selectedCategory === "all" ? "All Resources" : CATEGORY_FILTERS.find(f => f.id === selectedCategory)?.label}
          </h2>
          <p className="text-sm font-medium text-muted-foreground px-3 py-1 bg-foreground/5 rounded-md">
            {filteredCards.length} result{filteredCards.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Card grid - increased gap, wrapped nicely */}
        {filteredCards.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 md:gap-10 lg:justify-start">
            {filteredCards.map((card) => (
              <div key={card.id} className="flex justify-center transition-all duration-300">
                <LearningCardItem
                  card={card}
                  sectionColor={getSectionColor(card.category)}
                  onClick={() => handleCardClick(card)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-foreground/20 bg-foreground/5 p-12 text-center max-w-2xl mx-auto mt-10">
            <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-background ring-1 ring-foreground/10 shadow-sm">
              <Search className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">No resources found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="mt-6 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform active:scale-95"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <LearningDetailModal
        card={selectedCard}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
