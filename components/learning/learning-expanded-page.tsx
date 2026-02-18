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
  Brain,
  Globe,
  GraduationCap,
} from "lucide-react";

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

function getCategoryIcon(category: string) {
  switch (category) {
    case "logical-fallacy":
      return Brain;
    case "sdg":
      return Globe;
    case "general-lesson":
      return GraduationCap;
    default:
      return BookOpen;
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

        {/* Category filter chips */}
        {availableCategories.length > 2 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p className="mb-3 text-xs text-muted-foreground">
          {filteredCards.length} result{filteredCards.length !== 1 ? "s" : ""}
          {searchQuery || selectedCategory !== "all" ? " found" : ""}
        </p>

        {/* Card grid */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredCards.map((card) => {
              const sdg = card.sdgId ? getSDGById(card.sdgId) : null;
              const Icon = getCategoryIcon(card.category);

              return (
                <button
                  key={card.id}
                  onClick={() => onCardClick(card)}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-left transition-shadow hover:shadow-md"
                >
                  {/* Icon area */}
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-secondary">
                    {sdg ? (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold"
                        style={{ backgroundColor: sdg.color }}
                      >
                        {sdg.id}
                      </div>
                    ) : (
                      <Icon className="h-10 w-10 text-primary/40" />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                    {card.title}
                  </h3>
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
              No lessons match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
