"use client";

import { DebateCard } from "@/lib/models/debate-card";
import { getSDGsByIds } from "@/lib/data/sdg-data";
import { YouTubePlayer } from "@/components/debate/youtube-player";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Sparkles,
  MessageSquare,
  TrendingUp,
  Swords,
  Calendar,
  X,
  Gamepad2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CardViewModalProps {
  card: DebateCard | null;
  open: boolean;
  onClose: () => void;
}

// Deterministic AI insights derived from card data
function useCardAIInsights(card: DebateCard) {
  const seed = card.title.length + card.id.length;
  const proPct = 40 + (seed % 25);
  const conPct = 25 + (seed % 18);
  const neutral = Math.max(100 - proPct - conPct, 5);

  const allPoints = [
    "Economic impacts must be considered holistically.",
    "Ethical frameworks differ significantly across cultures.",
    "Policy implementation faces practical constraints.",
    "Data supports both sides of this argument.",
    "Public sentiment is shifting on this issue.",
  ];
  const keyPoints = allPoints.slice(seed % 2, (seed % 2) + 3);

  const difficulty = ["Moderate", "High", "Expert"][(seed % 3)];
  const engagement = ["Rising", "Trending", "Hot"][(seed % 3)];
  const aiStance = ["Nuanced — no clear winner", "Slight edge to Pro side", "Slight edge to Con side"][(seed % 3)];

  return { proPct, conPct, neutral, keyPoints, difficulty, engagement, aiStance };
}

const CATEGORY_CFG = {
  trending: { label: "Trending Today", color: "text-amber-300 bg-amber-500/15 border-amber-500/25" },
  continue: { label: "Continue Playing", color: "text-blue-300 bg-blue-500/15 border-blue-500/25" },
  recommended: { label: "Recommended", color: "text-purple-300 bg-purple-500/15 border-purple-500/25" },
};

export function CardViewModal({ card, open, onClose }: CardViewModalProps) {
  if (!card) return null;

  const sdgs = getSDGsByIds(card.sdgTags);
  const ai = useCardAIInsights(card);
  const catCfg = CATEGORY_CFG[card.category];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">{card.title}</DialogTitle>
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#111122] to-[#0d0d1a] shadow-2xl">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-0">
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-3">
              <div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold mb-2",
                  catCfg.color
                )}>
                  {catCfg.label}
                </span>
                <h2 className="text-base font-bold text-white leading-snug pr-8">
                  {card.title}
                </h2>
              </div>
            </div>

            {/* ── Video ───────────────────────────────────────────────── */}
            {card.videoUrl ? (
              <div className="mx-5 mb-4 rounded-xl overflow-hidden ring-1 ring-white/10">
                <YouTubePlayer url={card.videoUrl} title={card.title} />
              </div>
            ) : (
              <div className="mx-5 mb-4 flex aspect-video items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <MessageSquare className="h-12 w-12 text-white/10" />
              </div>
            )}

            {/* ── Two-column body ──────────────────────────────────────── */}
            <div className="grid grid-cols-5 gap-4 px-5 pb-5">

              {/* Left: AI Analysis (3 cols) */}
              <div className="col-span-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300 uppercase tracking-wide">AI Analysis</span>
                </div>

                {/* Stance split */}
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-2">
                  <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Stance Split</p>
                  <div className="flex h-2 w-full overflow-hidden rounded-full gap-0.5">
                    <div className="bg-violet-500 rounded-l-full" style={{ width: `${ai.proPct}%` }} />
                    <div className="bg-slate-600" style={{ width: `${ai.neutral}%` }} />
                    <div className="bg-rose-500 rounded-r-full" style={{ width: `${ai.conPct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/50">
                    <span className="text-violet-400">Pro {ai.proPct}%</span>
                    <span>Neutral {ai.neutral}%</span>
                    <span className="text-rose-400">Con {ai.conPct}%</span>
                  </div>
                </div>

                {/* Key points */}
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-2">
                  <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Key Discussion Points
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {ai.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics */}
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl bg-white/5 border border-white/8 px-3 py-2 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                    <div>
                      <p className="text-[10px] text-white/40">Engagement</p>
                      <p className="text-xs font-semibold text-amber-300">{ai.engagement}</p>
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl bg-white/5 border border-white/8 px-3 py-2 flex items-center gap-2">
                    <Swords className="h-3.5 w-3.5 text-sky-400" />
                    <div>
                      <p className="text-[10px] text-white/40">Difficulty</p>
                      <p className="text-xs font-semibold text-sky-300">{ai.difficulty}</p>
                    </div>
                  </div>
                </div>

                {/* AI stance */}
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-3 py-2">
                  <p className="text-[10px] text-violet-400/70 uppercase tracking-wide mb-0.5">AI Verdict</p>
                  <p className="text-xs text-violet-200 font-medium">{ai.aiStance}</p>
                </div>
              </div>

              {/* Right: Details + Actions (2 cols) */}
              <div className="col-span-2 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">Details</span>
                </div>

                {/* Meta */}
                <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/40">Added</p>
                      <p className="text-xs text-white/60">
                        {new Date(card.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* SDG Tags */}
                  {sdgs.length > 0 && (
                    <>
                      <div className="h-px bg-white/5" />
                      <div>
                        <p className="text-[10px] text-white/40 mb-1.5">SDG Goals</p>
                        <div className="flex flex-wrap gap-1">
                          {sdgs.map((sdg) => (
                            <span
                              key={sdg.id}
                              className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
                              style={{ backgroundColor: `${sdg.color}cc` }}
                            >
                              SDG {sdg.id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-white/50 leading-relaxed line-clamp-4">
                  {card.description}
                </p>

                <div className="flex-1" />

                {/* CTA */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20 font-semibold"
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Enter Debate Room
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full bg-transparent border-white/10 text-white/50 hover:bg-white/5 hover:text-white text-sm"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
