// components/debate/post-debate-summary-modal.tsx
"use client";

import { DebateJudgement, SCORE_WEIGHTS, RawScore } from "@/lib/models/debate-result";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Crown,
  Scale,
  Sparkles,
  ExternalLink,
  Heart,
  BarChart2,
  Target,
  RefreshCw,
  AlertCircle,
  Star,
  Zap,
  Shield,
  Swords,
  HandHeart,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PostDebateSummaryModalProps {
  open: boolean;
  isLoading: boolean;
  judgement: DebateJudgement | null;
  error?: string | null;
  onExit: () => void;
  onRetry?: () => void;
}

// ---------------------------------------------------------------------------
// Scoring category config
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: {
  key: keyof RawScore;
  label: string;
  weight: string;
  icon: React.ElementType;
  textColor: string;
  barColor: string;
}[] = [
  {
    key:       "argumentStrength",
    label:     "Argument Strength",
    weight:    `${SCORE_WEIGHTS.argumentStrength * 100}%`,
    icon:      Zap,
    textColor: "text-violet-400",
    barColor:  "bg-violet-500",
  },
  {
    key:       "rebuttalQuality",
    label:     "Rebuttal Quality",
    weight:    `${SCORE_WEIGHTS.rebuttalQuality * 100}%`,
    icon:      Shield,
    textColor: "text-sky-400",
    barColor:  "bg-sky-500",
  },
  {
    key:       "topicRelevance",
    label:     "Topic Relevance",
    weight:    `${SCORE_WEIGHTS.topicRelevance * 100}%`,
    icon:      Target,
    textColor: "text-amber-400",
    barColor:  "bg-amber-500",
  },
  {
    key:       "evidenceAccuracy",
    label:     "Evidence Accuracy",
    weight:    `${SCORE_WEIGHTS.evidenceAccuracy * 100}%`,
    icon:      BarChart2,
    textColor: "text-emerald-400",
    barColor:  "bg-emerald-500",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreBar({ value, barColor }: { value: number; barColor: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function DebaterScoreCard({
  result,
  isWinner,
}: {
  result: DebateJudgement["debaterA"];
  isWinner: boolean;
}) {
  const isPro = result.role === "pro";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 transition-all",
        isWinner
          ? isPro
            ? "bg-violet-500/10 border-violet-500/40 ring-1 ring-violet-500/30 shadow-lg shadow-violet-500/10"
            : "bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30 shadow-lg shadow-rose-500/10"
          : "bg-white/4 border-white/10",
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ring-1",
            isPro
              ? "bg-violet-500/20 ring-violet-500/30"
              : "bg-rose-500/20 ring-rose-500/30",
          )}
        >
          {isPro ? (
            <Shield className="h-4 w-4 text-violet-400" />
          ) : (
            <Swords className="h-4 w-4 text-rose-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{result.name}</p>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isPro ? "text-violet-400" : "text-rose-400",
            )}
          >
            {result.role}
          </span>
        </div>

        {isWinner && (
          <Crown className="h-5 w-5 flex-shrink-0 text-amber-400" />
        )}

        <div className="text-right flex-shrink-0">
          <p
            className={cn(
              "text-2xl font-bold tabular-nums",
              isPro ? "text-violet-300" : "text-rose-300",
            )}
          >
            {result.weighted}
          </p>
          <p className="text-[10px] text-white/30">/ 100</p>
        </div>
      </div>

      {/* Category bars */}
      <div className="flex flex-col gap-2.5">
        {CATEGORY_CONFIG.map((cat) => (
          <div key={cat.key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className={cn("flex items-center gap-1 text-white/50")}>
                <cat.icon className={cn("h-2.5 w-2.5", cat.textColor)} />
                {cat.label}
                <span className="text-white/25">({cat.weight})</span>
              </span>
              <span className={cn("font-bold tabular-nums", cat.textColor)}>
                {result.raw[cat.key]}
              </span>
            </div>
            <ScoreBar value={result.raw[cat.key]} barColor={cat.barColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------

export function PostDebateSummaryModal({
  open,
  isLoading,
  judgement,
  error,
  onExit,
  onRetry,
}: PostDebateSummaryModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">Debate Summary</DialogTitle>

        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0d0d1a] to-[#07070e] shadow-2xl">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* ── Loading state ────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-6 px-8 py-20">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-500/30">
                <Scale className="h-10 w-10 text-violet-400 animate-pulse" />
                {/* Spinning ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-white">AI Judge is evaluating…</p>
                <p className="mt-1 text-sm text-white/50">
                  Analysing arguments, rebuttals, evidence, and topic relevance
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORY_CONFIG.map((cat, i) => (
                  <div
                    key={cat.key}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/40"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full animate-ping", cat.barColor)} />
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Error state ──────────────────────────────────────────────── */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center gap-5 px-8 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 ring-1 ring-rose-500/30">
                <AlertCircle className="h-8 w-8 text-rose-400" />
              </div>

              <div className="text-center">
                <p className="text-base font-bold text-white">Judging Unavailable</p>
                <p className="mt-1 max-w-xs text-sm text-white/50">{error}</p>
              </div>

              <div className="flex gap-3">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    variant="outline"
                    className="border-white/10 bg-transparent text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                )}
                <Button
                  onClick={onExit}
                  className="bg-violet-600 text-white hover:bg-violet-500"
                >
                  Exit Debate
                </Button>
              </div>
            </div>
          )}

          {/* ── Results state ────────────────────────────────────────────── */}
          {!isLoading && !error && judgement && (
            <div className="flex flex-col">

              {/* Winner banner */}
              <div
                className={cn(
                  "flex flex-col items-center gap-3 border-b border-white/8 px-6 py-6",
                  judgement.winner === "draw"
                    ? "bg-gradient-to-b from-slate-500/10 to-transparent"
                    : judgement.winner === "A" && judgement.debaterA.role === "pro"
                    ? "bg-gradient-to-b from-violet-500/12 to-transparent"
                    : "bg-gradient-to-b from-rose-500/12 to-transparent",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
                      judgement.winner === "draw"
                        ? "bg-slate-500/20 ring-slate-500/30"
                        : "bg-amber-500/20 ring-amber-500/30",
                    )}
                  >
                    {judgement.winner === "draw" ? (
                      <Scale className="h-7 w-7 text-slate-400" />
                    ) : (
                      <Trophy className="h-7 w-7 text-amber-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      {judgement.winner === "draw" ? "It's a Draw" : "Winner"}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {judgement.winner === "draw"
                        ? "Both Debaters"
                        : judgement.winnerName}
                    </p>
                  </div>
                </div>

                {/* Score comparison */}
                <div className="flex items-center gap-4 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                  <span className="text-sm font-bold text-violet-300">
                    {judgement.debaterA.name}
                    <span className="ml-1.5 text-violet-400/70 text-xs">
                      {judgement.debaterA.weighted} pts
                    </span>
                  </span>
                  <span className="text-xs text-white/30">vs</span>
                  <span className="text-sm font-bold text-rose-300">
                    {judgement.debaterB.name}
                    <span className="ml-1.5 text-rose-400/70 text-xs">
                      {judgement.debaterB.weighted} pts
                    </span>
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-5 p-5">

                {/* Score breakdown */}
                <div>
                  <SectionHeader icon={BarChart2} label="Score Breakdown" color="text-white/40" />
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DebaterScoreCard
                      result={judgement.debaterA}
                      isWinner={judgement.winner === "A"}
                    />
                    <DebaterScoreCard
                      result={judgement.debaterB}
                      isWinner={judgement.winner === "B"}
                    />
                  </div>
                </div>

                {/* AI Summary */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                  <SectionHeader icon={Sparkles} label="AI Judge Summary" color="text-violet-300" />
                  <p className="mt-3 text-sm leading-relaxed text-white/75">
                    {judgement.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                {judgement.keyTakeaways.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <SectionHeader icon={Star} label="Key Takeaways" color="text-amber-300" />
                    <ul className="mt-3 flex flex-col gap-2">
                      {judgement.keyTakeaways.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Take Action — Charity Links */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HandHeart className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                      Take Action
                    </span>
                    <span className="text-[10px] text-white/30">
                      — organisations working on this topic
                    </span>
                  </div>

                  {judgement.charities.length === 0 ? (
                    <p className="text-xs text-white/30 italic">
                      No charity suggestions available for this topic.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {judgement.charities.map((charity, i) => (
                        <a
                          key={i}
                          href={charity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/4 p-3 transition-all hover:border-rose-500/30 hover:bg-rose-500/5"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-rose-500/15 ring-1 ring-rose-500/20 transition-all group-hover:ring-rose-500/40">
                            <Heart className="h-4 w-4 text-rose-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-rose-300">
                                {charity.name}
                              </p>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 text-white/30 transition-colors group-hover:text-rose-400" />
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-white/50">
                              {charity.description}
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-[10px] text-rose-400/70">
                              {charity.relevance}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exit CTA */}
                <Button
                  onClick={onExit}
                  className="mt-2 w-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-fuchsia-500"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Exit Debate
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tiny helper
// ---------------------------------------------------------------------------

function SectionHeader({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-4 w-4", color)} />
      <span className={cn("text-xs font-bold uppercase tracking-wider", color)}>
        {label}
      </span>
    </div>
  );
}
