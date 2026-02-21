"use client";

import { useState, useCallback } from "react";
import { CardSection } from "@/components/debate/card-section";
import { CardViewModal } from "@/components/debate/card-view-modal";
import { DedicatedTopicPage } from "@/components/debate/dedicated-topic-page";
import { CreateCardModal } from "@/components/debate/create-card-modal";
import { ExpandedListPage } from "@/components/debate/expanded-list-page";
import { YoutubeDebateSection } from "@/components/debate/youtube-challenge-section";
import { RaiseChallengeModal } from "@/components/debate/raise-challenge-modal";
import { ChallengeDetailModal } from "@/components/debate/challenge-detail-modal";
import { ScheduleDebateModal } from "@/components/debate/schedule-debate-modal";
import { DebateRoomPage } from "@/components/debate/debate-room-page";
import { StancePickerModal } from "@/components/debate/stance-picker-modal";
import {
  DebateCard,
  getCardsByCategory,
  type DebateCardData,
} from "@/lib/models/debate-card";
import {
  YoutubeChallenge,
  seedChallenges,
  type YoutubeChallengeData,
} from "@/lib/models/youtube-challenge";
import { TrendingUp, Play, Sparkles, Plus, Swords, Zap, Calendar, Radio } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils";

const CURRENT_USER = "DebateMe_User";

interface BrowsePageProps {
  onEnterDebateRoom?: (challenge: YoutubeChallenge, role?: "pro" | "con") => void;
}

type View =
  | { type: "browse" }
  | { type: "dedicated"; card: DebateCard }
  | { type: "expanded"; title: string; category: "trending" | "continue" | "recommended" }
  | { type: "debate-room"; challenge: YoutubeChallenge };

// Convert a DebateCard into a YoutubeChallenge so it can use the debate room
function cardToChallenge(card: DebateCard): YoutubeChallenge {
  return new YoutubeChallenge({
    id: `card-${card.id}`,
    raisedBy: CURRENT_USER,
    videoUrl: card.videoUrl ?? "",
    topic: card.title,
    description: card.description,
    status: "live",
    createdAt: card.createdAt,
  });
}

export function BrowsePage({ onEnterDebateRoom }: BrowsePageProps = {}) {
  // ── Existing debate cards ──────────────────────────────────────────────────
  const [trendingCards, setTrendingCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("trending")
  );
  const [continueCards, setContinueCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("continue")
  );
  const [recommendedCards, setRecommendedCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("recommended")
  );

  // ── YouTube Challenges ─────────────────────────────────────────────────────
  const [challenges, setChallenges] = useState<YoutubeChallenge[]>(() =>
    seedChallenges.map((d) => new YoutubeChallenge(d))
  );
  const [raiseChallengeOpen, setRaiseChallengeOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<YoutubeChallenge | null>(null);
  const [challengeDetailOpen, setChallengeDetailOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [pendingScheduleChallenge, setPendingScheduleChallenge] = useState<YoutubeChallenge | null>(null);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<View>({ type: "browse" });

  // ── Card modals ────────────────────────────────────────────────────────────
  const [cardViewCard, setCardViewCard] = useState<DebateCard | null>(null);
  const [cardViewOpen, setCardViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<
    "trending" | "continue" | "recommended"
  >("trending");

  // ── Stance Picker state ──────────────────────────────────────────────────
  const [stancePickerOpen, setStancePickerOpen] = useState(false);
  const [pendingCardForStance, setPendingCardForStance] = useState<DebateCard | null>(null);

  const openCardView = useCallback((card: DebateCard) => {
    setPendingCardForStance(card);
    setStancePickerOpen(true);
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

  const handleStanceSelect = useCallback((role: "pro" | "con") => {
    if (!pendingCardForStance) return;
    const challenge = cardToChallenge(pendingCardForStance);
    setStancePickerOpen(false);
    setPendingCardForStance(null);

    if (onEnterDebateRoom) {
      onEnterDebateRoom(challenge, role);
    } else {
      setCurrentView({ type: "debate-room", challenge });
    }
  }, [pendingCardForStance, onEnterDebateRoom]);

  const openExpanded = useCallback(
    (title: string, category: "trending" | "continue" | "recommended") => {
      setCurrentView({ type: "expanded", title, category });
    },
    []
  );

  const handleCreateSubmit = useCallback((data: DebateCardData) => {
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
  }, []);

  const getCardsByView = (category: "trending" | "continue" | "recommended") => {
    switch (category) {
      case "trending": return trendingCards;
      case "continue": return continueCards;
      case "recommended": return recommendedCards;
    }
  };

  // ── YouTube Challenge handlers ──────────────────────────────────────────────
  const handleRaiseChallengeSubmit = useCallback(
    (data: Omit<YoutubeChallengeData, "id" | "createdAt" | "status" | "raisedBy">) => {
      const newChallenge = new YoutubeChallenge({
        ...data,
        id: `ch-${Date.now()}`,
        raisedBy: CURRENT_USER,
        status: "open",
        createdAt: new Date().toISOString(),
      });
      setChallenges((prev) => [newChallenge, ...prev]);
    },
    []
  );

  const handleAcceptChallenge = useCallback((challenge: YoutubeChallenge) => {
    setChallengeDetailOpen(false);
    setPendingScheduleChallenge(challenge);
    setScheduleOpen(true);
  }, []);

  const handleScheduleConfirm = useCallback(
    (scheduledAt: Date) => {
      if (!pendingScheduleChallenge) return;
      setChallenges((prev) =>
        prev.map((ch) =>
          ch.id === pendingScheduleChallenge.id
            ? new YoutubeChallenge({
              ...ch,
              status: "scheduled",
              acceptedBy: CURRENT_USER,
              scheduledAt: scheduledAt.toISOString(),
            })
            : ch
        )
      );
      setScheduleOpen(false);
      setPendingScheduleChallenge(null);
    },
    [pendingScheduleChallenge]
  );

  const handleEnterRoom = useCallback((challenge: YoutubeChallenge) => {
    setChallengeDetailOpen(false);
    if (onEnterDebateRoom) {
      onEnterDebateRoom(challenge);
    } else {
      setCurrentView({ type: "debate-room", challenge });
    }
  }, [onEnterDebateRoom]);

  // ── Render sub-views ───────────────────────────────────────────────────────
  if (currentView.type === "debate-room") {
    return (
      <DebateRoomPage
        challenge={currentView.challenge}
        currentUser={CURRENT_USER}
        onExit={() => setCurrentView({ type: "browse" })}
      />
    );
  }

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

  // ── Main browse layout ─────────────────────────────────────────────────────
  return (
    <>
      {/*
       * LAYOUT OVERVIEW (desktop):
       * ┌─────────────────────────────────────────────┐
       * │ Browse Debates          [+ New Topic] btn   │  ← header
       * ├─────────────────────────────────────────────┤
       * │ ⚔️ YouTube Debate Challenges  [Raise Chall] │  ← full-width challenges
       * │  [card] [card] [card] → scroll               │
       * ├──────────────┬──────────────┬───────────────┤
       * │ 🔥 Trending  │ ▶ Continue   │ ✨ Recommended│  ← 3-col grid
       * │  card 1      │  card 1      │  card 1       │
       * │  card 2      │  card 2      │  card 2       │
       * │  card 3      │  card 3      │  card 3       │
       * └──────────────┴──────────────┴───────────────┘
       */
      }

      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 px-4 py-6 lg:px-10 lg:py-8">

        {/* ── Row 1: Page header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Browse Debates
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore topics, challenge ideas, and sharpen your thinking.
            </p>
          </div>
          <button
            onClick={() => openCreate("trending")}
            className="group flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
            New Topic
          </button>
        </div>

        {/* ── Row 2: YouTube Challenges (full width) ─────────────────────── */}
        <div className="rounded-2xl border border-violet-500/10 bg-violet-500/[0.03] p-5">
          {/* Header row with inline Raise Challenge button */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                <span className="text-base">⚔️</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground leading-tight">
                  YouTube Debate Challenges
                </h2>
                <p className="text-xs text-muted-foreground">
                  Paste any YouTube link · Raise a debate · Find your match
                </p>
              </div>
            </div>

            {/* ← Raise Challenge button right beside the title */}
            <button
              onClick={() => setRaiseChallengeOpen(true)}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/30 transition-all duration-200 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
              <span className="hidden sm:inline">Raise Challenge</span>
              <span className="sm:hidden">Raise</span>
            </button>
          </div>

          {/* Challenge cards */}
          {challenges.length === 0 ? (
            <button
              onClick={() => setRaiseChallengeOpen(true)}
              className="group flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-violet-500/30 bg-transparent py-6 transition-all hover:border-violet-500/50 hover:bg-violet-500/5"
            >
              <span className="text-sm text-muted-foreground">No challenges yet —</span>
              <span className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                Be the first to raise one!
              </span>
            </button>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
              {challenges.map((ch) => (
                <YoutubeChallengeMiniCard
                  key={ch.id}
                  challenge={ch}
                  isOwn={ch.raisedBy === CURRENT_USER}
                  onClick={() => {
                    setSelectedChallenge(ch);
                    setChallengeDetailOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Row 3: Three sections side by side ─────────────────────────── */}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          {/* Trending Today */}
          <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-4">
            <CardSection
              title="Trending Today"
              icon={TrendingUp}
              iconColor="#f59e0b"
              cards={trendingCards}
              onTapThumbnail={openCardView}
              onTapTitle={openDedicated}
              onExpandList={() => openExpanded("Trending Today", "trending")}
              variant="column"
              maxCards={4}
            />
          </div>

          {/* Continue Playing */}
          <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.03] p-4">
            <CardSection
              title="Continue Playing"
              icon={Play}
              iconColor="#3b82f6"
              cards={continueCards}
              onTapThumbnail={openCardView}
              onTapTitle={openDedicated}
              onExpandList={() => openExpanded("Continue Playing", "continue")}
              variant="column"
              maxCards={4}
            />
          </div>

          {/* Recommended */}
          <div className="rounded-2xl border border-purple-500/10 bg-purple-500/[0.03] p-4">
            <CardSection
              title="Recommended for You"
              icon={Sparkles}
              iconColor="#8b5cf6"
              cards={recommendedCards}
              onTapThumbnail={openCardView}
              onTapTitle={openDedicated}
              onExpandList={() => openExpanded("Recommended for You", "recommended")}
              variant="column"
              maxCards={4}
            />
          </div>
        </div>
      </div >

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
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
      <RaiseChallengeModal
        open={raiseChallengeOpen}
        onClose={() => setRaiseChallengeOpen(false)}
        onSubmit={handleRaiseChallengeSubmit}
      />
      <ChallengeDetailModal
        challenge={selectedChallenge}
        open={challengeDetailOpen}
        isOwn={selectedChallenge?.raisedBy === CURRENT_USER}
        onClose={() => setChallengeDetailOpen(false)}
        onAccept={handleAcceptChallenge}
        onEnterRoom={handleEnterRoom}
      />
      <ScheduleDebateModal
        open={scheduleOpen}
        opponentName={pendingScheduleChallenge?.raisedBy ?? "Opponent"}
        onClose={() => {
          setScheduleOpen(false);
          setPendingScheduleChallenge(null);
        }}
        onConfirm={handleScheduleConfirm}
      />
      <StancePickerModal
        open={stancePickerOpen}
        onClose={() => {
          setStancePickerOpen(false);
          setPendingCardForStance(null);
        }}
        onSelect={handleStanceSelect}
        card={pendingCardForStance}
      />
    </>
  );
}

// ─── Inline compact challenge card for the challenges row ──────────────────

function YoutubeChallengeMiniCard({
  challenge,
  isOwn,
  onClick,
}: {
  challenge: YoutubeChallenge;
  isOwn: boolean;
  onClick: () => void;
}) {
  const thumbnail = getYouTubeThumbnail(challenge.videoUrl, "medium");

  const STATUS = {
    open: { label: "Seeking Challenger", icon: Zap, color: "text-amber-300 bg-amber-500/20 border-amber-500/30" },
    matched: { label: "Matched", icon: Swords, color: "text-violet-300 bg-violet-500/20 border-violet-500/30" },
    scheduled: { label: "Scheduled", icon: Calendar, color: "text-sky-300 bg-sky-500/20 border-sky-500/30" },
    live: { label: "Live Now", icon: Radio, color: "text-rose-300 bg-rose-500/20 border-rose-500/30" },
  };
  const cfg = STATUS[challenge.status];
  const CfgIcon = cfg.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col w-72 flex-shrink-0 overflow-hidden rounded-xl border border-white/8 bg-card transition-all duration-200",
        "hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-36 w-full flex-shrink-0 overflow-hidden">
        {thumbnail ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <Swords className="h-8 w-8 text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-2 p-4 text-left">
        <p className="text-sm font-semibold leading-snug text-foreground">
          {challenge.topic}
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">
            {isOwn ? "You" : challenge.raisedBy} · {challenge.getTimeAgo()}
          </span>
          <span className={cn("inline-flex items-center gap-1 self-start rounded-md border px-2 py-0.5 text-xs font-semibold", cfg.color)}>
            <CfgIcon className="h-3 w-3" />
            {cfg.label}
          </span>
        </div>
      </div>
    </button>
  );
}
