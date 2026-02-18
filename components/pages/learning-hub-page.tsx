"use client";

import { useState, useCallback, useMemo } from "react";
import {
  logicalFallacyCards,
  sdgLearningCards,
  generalLessonCards,
  type LearningCard,
} from "@/lib/models/learning-card";
import { getSDGById } from "@/lib/data/sdg-data";
import { LearningDetailModal } from "@/components/learning/learning-detail-modal";
import { LearningExpandedPage } from "@/components/learning/learning-expanded-page";
import {
  Brain,
  Globe,
  GraduationCap,
  BookOpen,
  ChevronRight,
} from "lucide-react";

type View =
  | { type: "hub" }
  | { type: "expanded"; title: string; cards: LearningCard[] };

export function LearningHubPage() {
  const [selectedCard, setSelectedCard] = useState<LearningCard | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>({ type: "hub" });

  const openDetail = useCallback((card: LearningCard) => {
    setSelectedCard(card);
    setDetailOpen(true);
  }, []);

  const allCards = useMemo(
    () => [...logicalFallacyCards, ...sdgLearningCards, ...generalLessonCards],
    []
  );

  // If we're in expanded view
  if (currentView.type === "expanded") {
    return (
      <LearningExpandedPage
        title={currentView.title}
        cards={currentView.cards}
        onBack={() => setCurrentView({ type: "hub" })}
        onCardClick={openDetail}
      />
    );
  }

  const sections = [
    {
      title: "Logical Fallacies",
      subtitle: "Learn to identify and counter common logical fallacies",
      icon: Brain,
      color: "var(--color-primary)",
      cards: logicalFallacyCards,
    },
    {
      title: "SDG Learning",
      subtitle: "Explore the 17 UN Sustainable Development Goals",
      icon: Globe,
      color: "#0A97D9",
      cards: sdgLearningCards,
    },
    {
      title: "General Lessons",
      subtitle: "Critical thinking, sourcing, and misinformation",
      icon: GraduationCap,
      color: "#3F7E44",
      cards: generalLessonCards,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="px-4 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Learning Hub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your debating skills with structured lessons and resources.
          </p>
        </div>

        {/* View All button */}
        <div className="px-4 lg:px-8">
          <button
            onClick={() =>
              setCurrentView({
                type: "expanded",
                title: "All Learning Resources",
                cards: allCards,
              })
            }
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All Resources
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Sections with horizontal scroll */}
        {sections.map((section) => (
          <LearningSection
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            color={section.color}
            cards={section.cards}
            onCardClick={openDetail}
            onExpand={() =>
              setCurrentView({
                type: "expanded",
                title: section.title,
                cards: section.cards,
              })
            }
          />
        ))}
      </div>

      <LearningDetailModal
        card={selectedCard}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

// --- Section Component with horizontal scroll like Browse page ---

interface LearningSectionProps {
  title: string;
  subtitle: string;
  icon: typeof Brain;
  color: string;
  cards: LearningCard[];
  onCardClick: (card: LearningCard) => void;
  onExpand: () => void;
}

function LearningSection({
  title,
  subtitle,
  icon: Icon,
  color,
  cards,
  onCardClick,
  onExpand,
}: LearningSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: color + "18", color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onExpand}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline flex-shrink-0"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 hide-scrollbar lg:px-8">
        {cards.slice(0, 8).map((card) => (
          <LearningCardItem
            key={card.id}
            card={card}
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>
    </section>
  );
}

// --- Horizontal scroll card item ---

function LearningCardItem({
  card,
  onClick,
}: {
  card: LearningCard;
  onClick: () => void;
}) {
  const sdg = card.sdgId ? getSDGById(card.sdgId) : null;

  return (
    <button
      onClick={onClick}
      className="flex w-44 flex-shrink-0 flex-col gap-2 lg:w-56"
    >
      {/* Card thumbnail area */}
      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary transition-transform hover:scale-[1.02]">
        <div className="flex h-full w-full items-center justify-center">
          {sdg ? (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl text-white text-xl font-bold"
              style={{ backgroundColor: sdg.color }}
            >
              {sdg.id}
            </div>
          ) : card.category === "logical-fallacy" ? (
            <Brain className="h-10 w-10 text-primary/40 group-hover:text-primary/60 transition-colors" />
          ) : (
            <GraduationCap className="h-10 w-10 text-primary/40 group-hover:text-primary/60 transition-colors" />
          )}
        </div>
        {/* Category badge */}
        <div className="absolute bottom-2 left-2">
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
            style={{
              backgroundColor: sdg
                ? sdg.color
                : card.category === "logical-fallacy"
                  ? "var(--color-primary)"
                  : "#3F7E44",
            }}
          >
            {card.category === "logical-fallacy"
              ? "Fallacy"
              : card.category === "sdg"
                ? `SDG ${sdg?.id}`
                : "Lesson"}
          </span>
        </div>
      </div>

      {/* Title */}
      <p className="text-left text-sm font-semibold leading-tight text-foreground hover:text-primary transition-colors line-clamp-2">
        {card.title}
      </p>

      {/* Description */}
      <p className="text-left text-xs leading-relaxed text-muted-foreground line-clamp-2">
        {card.getSummary()}
      </p>
    </button>
  );
}
