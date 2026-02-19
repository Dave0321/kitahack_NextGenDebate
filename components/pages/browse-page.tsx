"use client";

import { useState, useCallback, useEffect } from "react";
import { CardSection } from "@/components/debate/card-section";
import { CardViewModal } from "@/components/debate/card-view-modal";
import { DedicatedTopicPage } from "@/components/debate/dedicated-topic-page";
import { CreateCardModal } from "@/components/debate/create-card-modal";
import { ExpandedListPage } from "@/components/debate/expanded-list-page";
import {
  DebateCard,
  type DebateCardData,
} from "@/lib/models/debate-card";
import {
  subscribeDebates,
  createDebate,
  seedDebatesIfEmpty,
  type DebateCategory,
} from "@/lib/debate-service";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Play, Sparkles } from "lucide-react";

type View =
  | { type: "browse" }
  | { type: "dedicated"; card: DebateCard }
  | { type: "expanded"; title: string; category: DebateCategory };

function getCardsByCategory(
  cards: DebateCard[],
  category: DebateCategory
): DebateCard[] {
  return cards.filter((c) => c.category === category);
}

export function BrowsePage() {
  const { user } = useAuth();
  const [allCards, setAllCards] = useState<DebateCard[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState<View>({ type: "browse" });

  const [cardViewCard, setCardViewCard] = useState<DebateCard | null>(null);
  const [cardViewOpen, setCardViewOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<DebateCategory>("trending");
  const [createSubmitting, setCreateSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsub = subscribeDebates((cards) => {
      setAllCards(cards);
      setLoading(false);
    });

    seedDebatesIfEmpty(user.uid).catch(() => {});

    return unsub;
  }, [user]);

  const openCardView = useCallback((card: DebateCard) => {
    setCardViewCard(card);
    setCardViewOpen(true);
  }, []);

  const openDedicated = useCallback((card: DebateCard) => {
    setCurrentView({ type: "dedicated", card });
  }, []);

  const openCreate = useCallback((category: DebateCategory) => {
    setCreateCategory(category);
    setCreateOpen(true);
  }, []);

  const openExpanded = useCallback(
    (title: string, category: DebateCategory) => {
      setCurrentView({ type: "expanded", title, category });
    },
    []
  );

  const handleCreateSubmit = useCallback(
    async (data: DebateCardData) => {
      if (!user) return;
      setCreateSubmitting(true);
      try {
        await createDebate({
          title: data.title,
          description: data.description,
          videoUrl: data.videoUrl,
          sdgTags: data.sdgTags,
          category: data.category,
          creatorId: user.uid,
        });
        setCreateOpen(false);
      } finally {
        setCreateSubmitting(false);
      }
    },
    [user]
  );

  const trendingCards = getCardsByCategory(allCards, "trending");
  const continueCards = getCardsByCategory(allCards, "continue");
  const recommendedCards = getCardsByCategory(allCards, "recommended");

  const getCardsByView = (category: DebateCategory) => {
    switch (category) {
      case "trending":
        return trendingCards;
      case "continue":
        return continueCards;
      case "recommended":
        return recommendedCards;
    }
  };

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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading debates…</p>
      </div>
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
        <div className="px-4 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Browse Debates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore topics, challenge ideas, and sharpen your thinking.
          </p>
        </div>

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
        submitting={createSubmitting}
      />
    </>
  );
}
