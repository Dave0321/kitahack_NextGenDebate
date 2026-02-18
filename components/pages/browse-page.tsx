"use client";

import { useState, useCallback } from "react";
import { CardSection } from "@/components/debate/card-section";
import { CardViewModal } from "@/components/debate/card-view-modal";
import { DedicatedTopicPage } from "@/components/debate/dedicated-topic-page";
import { CreateCardModal } from "@/components/debate/create-card-modal";
import { ExpandedListPage } from "@/components/debate/expanded-list-page";
import {
  DebateCard,
  getCardsByCategory,
  type DebateCardData,
} from "@/lib/models/debate-card";
import { TrendingUp, Play, Sparkles } from "lucide-react";

type View =
  | { type: "browse" }
  | { type: "dedicated"; card: DebateCard }
  | { type: "expanded"; title: string; category: "trending" | "continue" | "recommended" };

export function BrowsePage() {
  const [trendingCards, setTrendingCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("trending")
  );
  const [continueCards, setContinueCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("continue")
  );
  const [recommendedCards, setRecommendedCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("recommended")
  );

  const [currentView, setCurrentView] = useState<View>({ type: "browse" });

  // Card View modal state
  const [cardViewCard, setCardViewCard] = useState<DebateCard | null>(null);
  const [cardViewOpen, setCardViewOpen] = useState(false);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<
    "trending" | "continue" | "recommended"
  >("trending");

  const openCardView = useCallback((card: DebateCard) => {
    setCardViewCard(card);
    setCardViewOpen(true);
  }, []);

  const openDedicated = useCallback((card: DebateCard) => {
    setCurrentView({ type: "dedicated", card });
  }, []);

  const openCreate = useCallback(
    (category: "trending" | "continue" | "recommended") => {
      setCreateCategory(category);
      setCreateOpen(true);
    },
    []
  );

  const openExpanded = useCallback(
    (title: string, category: "trending" | "continue" | "recommended") => {
      setCurrentView({ type: "expanded", title, category });
    },
    []
  );

  const handleCreateSubmit = useCallback(
    (data: DebateCardData) => {
      const newCard = new DebateCard(data);
      switch (data.category) {
        case "trending":
          setTrendingCards((prev) => [newCard, ...prev]);
          break;
        case "continue":
          setContinueCards((prev) => [newCard, ...prev]);
          break;
        case "recommended":
          setRecommendedCards((prev) => [newCard, ...prev]);
          break;
      }
    },
    []
  );

  const getCardsByView = (category: "trending" | "continue" | "recommended") => {
    switch (category) {
      case "trending":
        return trendingCards;
      case "continue":
        return continueCards;
      case "recommended":
        return recommendedCards;
    }
  };

  // Render sub-views
  if (currentView.type === "dedicated") {
    return (
      <DedicatedTopicPage
        card={currentView.card}
        onBack={() => setCurrentView({ type: "browse" })}
      />
    );
  }

  if (currentView.type === "expanded") {
    return (
      <ExpandedListPage
        title={currentView.title}
        cards={getCardsByView(currentView.category)}
        onBack={() => setCurrentView({ type: "browse" })}
        onTapCard={openCardView}
        onTapTitle={openDedicated}
      />
    );
  }

  const sections = [
    {
      title: "Trending Today",
      category: "trending" as const,
      cards: trendingCards,
      icon: TrendingUp,
    },
    {
      title: "Continue Playing",
      category: "continue" as const,
      cards: continueCards,
      icon: Play,
    },
    {
      title: "Recommended for You",
      category: "recommended" as const,
      cards: recommendedCards,
      icon: Sparkles,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-8 py-6">
        {/* Welcome header */}
        <div className="px-4 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Browse Debates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore topics, challenge ideas, and sharpen your thinking.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <CardSection
            key={section.category}
            title={section.title}
            cards={section.cards}
            onTapThumbnail={openCardView}
            onTapTitle={openDedicated}
            onAdd={() => openCreate(section.category)}
            onExpandList={() =>
              openExpanded(section.title, section.category)
            }
          />
        ))}
      </div>

      {/* Modals */}
      <CardViewModal
        card={cardViewCard}
        open={cardViewOpen}
        onClose={() => setCardViewOpen(false)}
      />
      <CreateCardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        defaultCategory={createCategory}
      />
    </>
  );
}
