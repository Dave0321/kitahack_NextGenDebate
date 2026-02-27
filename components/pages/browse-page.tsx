"use client";

import { useState, useCallback, useEffect } from "react";
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
  loadChallenges,
  saveChallenges,
  type YoutubeChallengeData,
} from "@/lib/models/youtube-challenge";
import { TrendingUp, Play, Sparkles, Plus, Swords, Zap, Calendar, Radio, Trash2 } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils";

const CURRENT_USER = "DebateEnthusiast";

interface BrowsePageProps {
  onEnterDebateRoom?: (challenge: YoutubeChallenge, role?: "pro" | "con") => void;
}

type View =
  | { type: "browse" }
  | { type: "dedicated"; card: DebateCard }
  | { type: "expanded"; title: string; category: "trending" | "recommended" }
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
    visibility: "public",
  });
}

export function BrowsePage({ onEnterDebateRoom }: BrowsePageProps = {}) {
  // ── Existing debate cards ──────────────────────────────────────────────────
  const [trendingCards, setTrendingCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("trending")
  );
  const [recommendedCards, setRecommendedCards] = useState<DebateCard[]>(() =>
    getCardsByCategory("recommended")
  );

  // ── YouTube Challenges & AI Debates ────────────────────────────────────────
  const [challenges, setChallenges] = useState<YoutubeChallenge[]>(() =>
    loadChallenges().map((d) => new YoutubeChallenge(d))
  );

  const [aiChallenges, setAiChallenges] = useState<YoutubeChallenge[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("debate_me_ai_challenges");
      if (saved) {
        try {
          return JSON.parse(saved).map((d: any) => new YoutubeChallenge(d));
        } catch (e) {
          console.error("Failed to parse AI challenges", e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    // Initial seeding if empty
    if (typeof window !== "undefined" && !localStorage.getItem("debate_me_challenges")) {
      saveChallenges(loadChallenges());
    }

    const syncChallenges = () => {
      setChallenges(loadChallenges().map((d) => new YoutubeChallenge(d)));
    };

    window.addEventListener("debate_me_challenges_updated", syncChallenges);
    window.addEventListener("storage", syncChallenges);

    return () => {
      window.removeEventListener("debate_me_challenges_updated", syncChallenges);
      window.removeEventListener("storage", syncChallenges);
    };
  }, []);

  // Save AI Challenges whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("debate_me_ai_challenges", JSON.stringify(aiChallenges));
    }
  }, [aiChallenges]);

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
    "trending" | "recommended"
  >("trending");

  // ── AI Challenge State ──────────────────────────────────────────────────
  const [raiseAiChallengeOpen, setRaiseAiChallengeOpen] = useState(false);

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

  const [activeFilters, setActiveFilters] = useState<("trending" | "recommended")[]>([]);
  const handleFilterChange = useCallback((category: "trending" | "recommended") => {
    setActiveFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const openCreate = useCallback(
    (category: "trending" | "recommended") => {
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

  // When user picks "Real Player" in the stance picker, open Raise Challenge pre-filled
  const [preFillTopic, setPreFillTopic] = useState<string | undefined>(undefined);
  const handleRaiseFromCard = useCallback((card: DebateCard) => {
    setPreFillTopic(card.title);
    setRaiseChallengeOpen(true);
  }, []);


  const openExpanded = useCallback(
    (title: string, category: "trending" | "recommended") => {
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
      case "recommended":
        setRecommendedCards((prev) => [newCard, ...prev]);
        break;
    }
  }, []);

  const getCardsByView = (category: "trending" | "recommended") => {
    switch (category) {
      case "trending": return trendingCards;
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
      const next = [newChallenge, ...challenges];
      setChallenges(next);
      saveChallenges(next);
    },
    [challenges]
  );

  const handleRaiseAiChallengeSubmit = useCallback(
    (data: Omit<YoutubeChallengeData, "id" | "createdAt" | "status" | "raisedBy">) => {
      const newChallenge = new YoutubeChallenge({
        ...data,
        id: `ai-${Date.now()}`,
        raisedBy: CURRENT_USER,
        status: "matched", // AI debates are instantly matched
        acceptedBy: "AI Debater",
        createdAt: new Date().toISOString(),
      });
      setAiChallenges((prev) => [newChallenge, ...prev]);
    },
    []
  );

  const handleDeleteChallenge = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      const next = challenges.filter((ch) => ch.id !== id);
      setChallenges(next);
      saveChallenges(next);
    }
  }, [challenges]);

  const handleAcceptChallenge = useCallback((challenge: YoutubeChallenge) => {
    setChallengeDetailOpen(false);
    setPendingScheduleChallenge(challenge);
    setScheduleOpen(true);
  }, []);

  const handleScheduleConfirm = useCallback(
    (scheduledAt: Date) => {
      if (!pendingScheduleChallenge) return;
      setChallenges((prev) => {
        const next = prev.map((ch) =>
          ch.id === pendingScheduleChallenge.id
            ? new YoutubeChallenge({
              ...ch,
              status: "scheduled",
              acceptedBy: CURRENT_USER,
              scheduledAt: scheduledAt.toISOString(),
            })
            : ch
        );
        saveChallenges(next);
        return next;
      });
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
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-background pb-20">

        {/* ── Modern Hero Section ─────────────────────────────────────────── */}
        <div className="px-4 pt-6 pb-4 lg:px-8 mx-auto w-full max-w-7xl">
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-violet-950 via-[#0f0c29] to-fuchsia-950 p-6 md:p-10 lg:p-12 shadow-2xl border border-white/10 group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay" />

            <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 rounded-full blur-[100px] transition-transform duration-700 group-hover:translate-x-10 group-hover:translate-y-10" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/30 rounded-full blur-[100px] transition-transform duration-700 group-hover:-translate-x-10 group-hover:-translate-y-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-[#0d0a20] to-transparent opacity-50" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md shadow-lg transition-transform hover:scale-105 cursor-pointer">
                <Swords className="h-3 w-3 text-fuchsia-400" />
                <span className="text-[10px] font-black text-fuchsia-100 uppercase tracking-widest">The Arena</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4 drop-shadow-sm">
                Where Ideas <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Collide
                </span>
              </h1>

              <p className="text-sm md:text-base text-white/70 mb-8 max-w-xl font-medium leading-relaxed">
                Challenge perspectives, defend your stance, and rise through the ranks. Connect with global thinkers or practice against our elite AI debaters.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <button
                  onClick={() => {
                    const searchBar = document.querySelector('input[type="text"]');
                    if (searchBar) (searchBar as HTMLInputElement).focus();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-violet-950 font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
                >
                  Find a Match
                </button>

                <button
                  onClick={() => setRaiseAiChallengeOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-2 overflow-hidden group/btn relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="text-lg group-hover/btn:animate-bounce relative z-10 drop-shadow-md">🤖</span>
                  <span className="relative z-10">Train with AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 lg:px-10 lg:py-12">

          {/* ── Live Matches / Challenges Section ─────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Radio className="h-6 w-6 text-rose-500" />
                  Live & Upcoming Matches
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Join a live debate or throw down the gauntlet and challenge someone directly.
                </p>
              </div>
              <button
                onClick={() => setRaiseChallengeOpen(true)}
                className="hidden sm:flex text-base font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
              >
                + Raise Challenge
              </button>
            </div>

            <div className="rounded-3xl border border-rose-500/5 bg-gradient-to-br from-rose-950/10 via-background to-orange-950/5 shadow-lg shadow-rose-900/5 backdrop-blur-xl p-6 transition-all hover:border-rose-500/10 group">
              <div className="mb-4 sm:hidden">
                <button
                  onClick={() => setRaiseChallengeOpen(true)}
                  className="w-full rounded-xl bg-violet-600/10 px-4 py-2.5 text-base font-semibold text-violet-700 dark:text-violet-400"
                >
                  Raise Challenge
                </button>
              </div>
              {challenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20">
                    <Swords className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">No active challenges</h3>
                    <p className="text-base text-muted-foreground mt-1 mb-5">Be the first to step into the arena.</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                  {challenges.map((ch) => (
                    <YoutubeChallengeMiniCard
                      key={ch.id}
                      challenge={ch}
                      isOwn={ch.raisedBy === CURRENT_USER}
                      onClick={() => {
                        setSelectedChallenge(ch);
                        setChallengeDetailOpen(true);
                      }}
                      onDelete={() => handleDeleteChallenge(ch.id)}
                      onJoinInstantly={() => handleEnterRoom(ch)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Explore Topics (Trending & Recommended) ─────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                  Explore Topics
                </h2>
                <p className="mt-2 text-base text-muted-foreground">Find a topic that sparks your interest and take a stance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Trending */}
              <div className="rounded-3xl border border-amber-500/5 bg-gradient-to-br from-amber-950/10 via-background to-yellow-950/5 backdrop-blur-xl p-5 sm:p-7 transition-all hover:border-amber-500/10 hover:shadow-lg hover:shadow-amber-900/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
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

              {/* Recommended */}
              <div className="rounded-3xl border border-purple-500/5 bg-gradient-to-br from-purple-950/10 via-background to-fuchsia-950/5 backdrop-blur-xl p-5 sm:p-7 transition-all hover:border-purple-500/10 hover:shadow-lg hover:shadow-purple-900/5 relative overflow-hidden group">
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
          </div>

          {/* ── AI Debate Section ─────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-6 w-6 text-emerald-500" />
                  Your AI Training Sessions
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Resume past debates with AI counterparts or start a new rigorous session.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-500/5 bg-gradient-to-br from-emerald-950/10 via-background to-teal-950/5 backdrop-blur-xl p-6 shadow-lg shadow-emerald-900/5 transition-all hover:border-emerald-500/10 group">
              {aiChallenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <p className="text-base text-muted-foreground mt-2">No AI debates yet. Ready to test your rhetoric?</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                  {aiChallenges.map((ch) => (
                    <YoutubeChallengeMiniCard
                      key={ch.id}
                      challenge={ch}
                      isOwn={true}
                      onClick={() => handleEnterRoom(ch)}
                      onDelete={() => {
                        if (window.confirm("Are you sure you want to delete this AI debate?")) {
                          setAiChallenges(prev => prev.filter(c => c.id !== ch.id));
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

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
        onClose={() => { setRaiseChallengeOpen(false); setPreFillTopic(undefined); }}
        onSubmit={handleRaiseChallengeSubmit}
        preFillTopic={preFillTopic}
      />
      <RaiseChallengeModal
        open={raiseAiChallengeOpen}
        onClose={() => setRaiseAiChallengeOpen(false)}
        onSubmit={handleRaiseAiChallengeSubmit}
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
        onRaiseChallenge={handleRaiseFromCard}
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
  onDelete,
  onJoinInstantly,
}: {
  challenge: YoutubeChallenge;
  isOwn: boolean;
  onClick: () => void;
  onDelete: () => void;
  onJoinInstantly?: () => void;
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
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col w-72 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/8 bg-card transition-all duration-200",
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

        {/* Join Instantly button — visible for open/live challenges raised by others */}
        {!isOwn && (challenge.status === "open" || challenge.status === "live") && onJoinInstantly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoinInstantly();
            }}
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3 w-3" />
            Join Instantly
          </button>
        )}
      </div>

      {/* Delete button if owned */}
      {isOwn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 opacity-0 transition-all hover:bg-rose-500 hover:text-white group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
