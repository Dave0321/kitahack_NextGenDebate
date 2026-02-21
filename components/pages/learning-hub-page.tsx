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
  ChevronRight,
  BookOpen,
  Zap,
  Award,
  BarChart2,
  Layers,
} from "lucide-react";

type View =
  | { type: "hub" }
  | { type: "expanded"; title: string; cards: LearningCard[] };

// Mock stats for the hero (dark bg → light text/icons already correct)
const STATS = [
  { label: "Topics Covered", value: "27", icon: Layers, color: "#a78bfa" },
  { label: "SDGs Explored", value: "17", icon: Globe, color: "#38bdf8" },
  { label: "Fallacies", value: "6", icon: Zap, color: "#fbbf24" },
  { label: "Lessons", value: "4", icon: Award, color: "#4ade80" },
];

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
      color: "#8b5cf6", // violet-500
      gradientFrom: "from-violet-500/10",
      gradientTo: "to-violet-500/5",
      borderColor: "border-violet-500/20",
      badgeBg: "bg-violet-500",
      badgeText: "text-white",
      cards: logicalFallacyCards,
      tag: "Critical Thinking",
    },
    {
      title: "SDG Learning",
      subtitle: "Explore the 17 UN Sustainable Development Goals",
      icon: Globe,
      color: "#0ea5e9", // sky-500
      gradientFrom: "from-sky-500/10",
      gradientTo: "to-sky-500/5",
      borderColor: "border-sky-500/20",
      badgeBg: "bg-sky-500",
      badgeText: "text-white",
      cards: sdgLearningCards,
      tag: "Global Goals",
    },
    {
      title: "General Lessons",
      subtitle: "Critical thinking, sourcing, and misinformation",
      icon: GraduationCap,
      color: "#10b981", // emerald-500
      gradientFrom: "from-emerald-500/10",
      gradientTo: "to-emerald-500/5",
      borderColor: "border-emerald-500/20",
      badgeBg: "bg-emerald-500",
      badgeText: "text-white",
      cards: generalLessonCards,
      tag: "Fundamentals",
    }
  ];

  return (
    <>
      <div className="flex flex-col gap-0 min-h-screen bg-background">
        {/* ── Hero Header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden border-b border-foreground/5 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 px-4 py-8 lg:px-10 dark:from-[#051f15] dark:via-[#091515] dark:to-[#051a1a] dark:border-white/5">
          {/* Background elements */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl dark:opacity-40" />
          <div className="pointer-events-none absolute -top-10 right-1/4 h-48 w-48 rounded-full bg-teal-600/20 blur-3xl dark:opacity-40" />

          <div className="relative flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Title row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/30">
                    <BookOpen className="h-4 w-4 text-emerald-300" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-300/80 uppercase tracking-[0.2em]">
                    The Academy
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white lg:text-4xl leading-tight">
                  Sharpen Your Mind
                </h1>
                <p className="mt-1.5 text-sm text-white/70 max-w-md">
                  Master debate skills, spot fallacies, and explore global goals.
                </p>
              </div>
              {/* View all button */}
              <button
                onClick={() =>
                  setCurrentView({
                    type: "expanded",
                    title: "All Learning Resources",
                    cards: allCards,
                  })
                }
                className="flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-all group"
              >
                View All
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
                >
                  <stat.icon className="h-5 w-5 mb-0.5" style={{ color: stat.color }} />
                  <span className="text-xl font-black text-white">{stat.value}</span>
                  <span className="text-[11px] text-white/60 text-center font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-10 px-4 py-8 lg:px-10 max-w-7xl mx-auto w-full">
          {sections.map((section) => (
            <LearningSection
              key={section.title}
              section={section}
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
      </div>

      <LearningDetailModal
        card={selectedCard}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}

// ─── Section Component ─────────────────────────────────────────────────────

interface SectionDef {
  title: string;
  subtitle: string;
  icon: typeof Brain;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  cards: LearningCard[];
  tag: string;
}

function LearningSection({
  section,
  onCardClick,
  onExpand,
}: {
  section: SectionDef;
  onCardClick: (card: LearningCard) => void;
  onExpand: () => void;
}) {
  const Icon = section.icon;

  return (
    <section className="flex flex-col gap-5">
      {/* Section header card — dynamic gradient bg */}
      <div
        className={`relative overflow-hidden rounded-2xl border ${section.borderColor.replace('border-', 'border-')} bg-gradient-to-br ${section.gradientFrom.replace('from-', 'from-')} ${section.gradientTo.replace('to-', 'to-')} px-6 py-5`}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: section.color }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ring-1 shadow-sm"
              style={{
                backgroundColor: section.color + "15",
                color: section.color,
                boxShadow: `0 0 0 1px ${section.color}30`,
              }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                {/* Section title */}
                <h2 className="text-lg font-black text-foreground leading-none">{section.title}</h2>
                {/* Badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${section.badgeBg} ${section.badgeText}`}>
                  {section.tag}
                </span>
              </div>
              {/* Subtitle */}
              <p className="text-sm text-muted-foreground">{section.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium text-muted-foreground bg-foreground/5 px-2.5 py-1 rounded-md">{section.cards.length} cards</span>
            {/* "View All" pill */}
            <button
              onClick={onExpand}
              className="flex items-center gap-1 rounded-lg bg-foreground/5 border border-foreground/10 px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/10 transition-all group"
            >
              View All
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 hide-scrollbar">
        {section.cards.slice(0, 8).map((card) => (
          <LearningCardItem
            key={card.id}
            card={card}
            sectionColor={section.color}
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Card item ───────────────────────────────────────────────────────────────

export function LearningCardItem({
  card,
  sectionColor,
  onClick,
}: {
  card: LearningCard;
  sectionColor: string;
  onClick: () => void;
}) {
  const sdg = card.sdgId ? getSDGById(card.sdgId) : null;
  const effectiveColor = sdg ? sdg.color : sectionColor;

  return (
    <button
      onClick={onClick}
      className="group flex w-64 flex-shrink-0 flex-col gap-0 rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5 hover:border-foreground/20 lg:w-72"
    >
      {/* Thumbnail / icon area — dark bg so icons are clearly visible */}
      <div
        className="relative flex h-28 w-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: effectiveColor + "18" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-15 transition-opacity group-hover:opacity-30 dark:opacity-25 dark:group-hover:opacity-40"
          style={{ background: `radial-gradient(circle at center, ${effectiveColor}, transparent 70%)` }}
        />

        {sdg ? (
          <div
            className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl text-white text-xl font-black shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{ backgroundColor: sdg.color }}
          >
            {/* SDG number */}
            {sdg.id}
          </div>
        ) : card.category === "logical-fallacy" ? (
          <Brain className="relative z-10 h-10 w-10 transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ color: effectiveColor }} />
        ) : (
          <GraduationCap className="relative z-10 h-10 w-10 transition-transform group-hover:scale-110" style={{ color: effectiveColor }} />
        )}

        {/* Category badge — solid colour bg → white text ✓ */}
        <div className="absolute bottom-2 left-2 z-20">
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white"
            style={{ backgroundColor: effectiveColor }}
          >
            {card.category === "logical-fallacy"
              ? "Fallacy"
              : card.category === "sdg"
                ? `SDG ${sdg?.id}`
                : "Lesson"}
          </span>
        </div>

        {card.category === "sdg" && sdg && (
          <div className="absolute right-2 top-2">
            <BarChart2 className="h-3.5 w-3.5 text-white/40" />
          </div>
        )}
      </div>

      {/* Text area */}
      <div className="flex flex-col gap-2 p-4 bg-card h-full">
        {/* Title */}
        <p className="text-left text-base font-bold leading-tight text-foreground transition-colors line-clamp-2">
          {card.title}
        </p>
        {/* Summary */}
        <p className="text-left text-sm leading-relaxed text-muted-foreground line-clamp-2 mt-auto">
          {card.getSummary()}
        </p>
      </div>
    </button>
  );
}
