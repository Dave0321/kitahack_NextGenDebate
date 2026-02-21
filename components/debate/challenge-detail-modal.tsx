"use client";

import { YoutubeChallenge } from "@/lib/models/youtube-challenge";
import { YouTubePlayer } from "@/components/debate/youtube-player";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Swords,
    User,
    Calendar,
    Clock,
    Zap,
    Radio,
    Sparkles,
    MessageSquare,
    TrendingUp,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeDetailModalProps {
    challenge: YoutubeChallenge | null;
    open: boolean;
    isOwn: boolean;
    onClose: () => void;
    onAccept: (challenge: YoutubeChallenge) => void;
    onEnterRoom: (challenge: YoutubeChallenge) => void;
}

// Deterministic "AI analysis" derived from the challenge data
function useAIInsights(challenge: YoutubeChallenge) {
    const seed = challenge.topic.length + challenge.raisedBy.length;
    const stances = [
        { label: "Pro", pct: 45 + (seed % 20) },
        { label: "Con", pct: 30 + (seed % 15) },
    ];
    stances[1].pct = Math.min(stances[1].pct, 100 - stances[0].pct - 5);
    const neutral = 100 - stances[0].pct - stances[1].pct;

    const keyPoints = [
        "Economic implications are central to this debate.",
        "Historical precedents show mixed outcomes.",
        "Public opinion is closely divided on this topic.",
    ].slice(0, 2 + (seed % 2));

    const difficulty = ["Moderate", "High", "Very High"][(seed % 3)];
    const engagement = ["Rising", "Trending", "Hot"][(seed % 3)];

    return { stances, neutral, keyPoints, difficulty, engagement };
}

const STATUS_CFG = {
    open: { label: "Seeking Challenger", icon: Zap, color: "text-amber-300 bg-amber-500/15 border-amber-500/25", pulse: true },
    matched: { label: "Matched", icon: Swords, color: "text-violet-300 bg-violet-500/15 border-violet-500/25", pulse: false },
    scheduled: { label: "Scheduled", icon: Calendar, color: "text-sky-300 bg-sky-500/15 border-sky-500/25", pulse: false },
    live: { label: "Live Now", icon: Radio, color: "text-rose-300 bg-rose-500/15 border-rose-500/25", pulse: true },
};

export function ChallengeDetailModal({
    challenge,
    open,
    isOwn,
    onClose,
    onAccept,
    onEnterRoom,
}: ChallengeDetailModalProps) {
    if (!challenge) return null;

    const canEnter = challenge.status === "scheduled" || challenge.status === "live";
    const canAccept = !isOwn && challenge.status === "open";
    const cfg = STATUS_CFG[challenge.status];
    const StatusIcon = cfg.icon;
    const ai = useAIInsights(challenge);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">{challenge.topic}</DialogTitle>
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#111122] to-[#0d0d1a] shadow-2xl">
                    {/* Top accent line */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="flex flex-col gap-0">
                        {/* ── Header ────────────────────────────────────────────────── */}
                        <div className="flex items-start gap-3 px-5 pt-5 pb-3">
                            <div>
                                {/* Status badge */}
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold mb-2",
                                    cfg.color
                                )}>
                                    {cfg.pulse && (
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-current" />
                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                                        </span>
                                    )}
                                    <StatusIcon className="h-3 w-3" />
                                    {cfg.label}
                                </span>
                                <h2 className="text-base font-bold text-white leading-snug pr-8">
                                    {challenge.topic}
                                </h2>
                            </div>
                        </div>

                        {/* ── Video ─────────────────────────────────────────────────── */}
                        <div className="mx-5 mb-4 rounded-xl overflow-hidden ring-1 ring-white/10">
                            <YouTubePlayer url={challenge.videoUrl} title={challenge.topic} />
                        </div>

                        {/* ── Two-column body ───────────────────────────────────────── */}
                        <div className="grid grid-cols-5 gap-4 px-5 pb-5">

                            {/* Left: AI Analysis (3 cols) */}
                            <div className="col-span-3 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                                    <span className="text-xs font-semibold text-violet-300 uppercase tracking-wide">AI Analysis</span>
                                </div>

                                {/* Stance distribution */}
                                <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-2">
                                    <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Stance Split</p>
                                    <div className="flex h-2 w-full overflow-hidden rounded-full gap-0.5">
                                        <div className="bg-violet-500 rounded-l-full transition-all" style={{ width: `${ai.stances[0].pct}%` }} />
                                        <div className="bg-slate-600 transition-all" style={{ width: `${ai.neutral}%` }} />
                                        <div className="bg-rose-500 rounded-r-full transition-all" style={{ width: `${ai.stances[1].pct}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-white/50">
                                        <span className="text-violet-400">Pro {ai.stances[0].pct}%</span>
                                        <span>Neutral {ai.neutral}%</span>
                                        <span className="text-rose-400">Con {ai.stances[1].pct}%</span>
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

                                {/* Metrics row */}
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
                            </div>

                            {/* Right: Meta + Actions (2 cols) */}
                            <div className="col-span-2 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-white/40" />
                                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">Details</span>
                                </div>

                                {/* Meta */}
                                <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-violet-500/30 flex-shrink-0">
                                            <User className="h-3 w-3 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40">Raised by</p>
                                            <p className="text-xs font-semibold text-white/80">
                                                {isOwn ? "You" : challenge.raisedBy}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-white/40">Posted</p>
                                            <p className="text-xs text-white/60">{challenge.getTimeAgo()}</p>
                                        </div>
                                    </div>
                                    {challenge.scheduledAt && (
                                        <>
                                            <div className="h-px bg-white/5" />
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-[10px] text-white/40">Scheduled</p>
                                                    <p className="text-xs text-sky-300">
                                                        {new Date(challenge.scheduledAt).toLocaleDateString("en-US", {
                                                            month: "short", day: "numeric",
                                                            hour: "2-digit", minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                {challenge.description && (
                                    <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                                        {challenge.description}
                                    </p>
                                )}

                                {/* Spacer pushes buttons to bottom */}
                                <div className="flex-1" />

                                {/* CTA buttons */}
                                <div className="flex flex-col gap-2">
                                    {canAccept && (
                                        <Button
                                            onClick={() => onAccept(challenge)}
                                            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20 font-semibold"
                                        >
                                            <Swords className="h-4 w-4 mr-2" />
                                            Accept Challenge
                                        </Button>
                                    )}

                                    {canEnter && (
                                        <Button
                                            onClick={() => onEnterRoom(challenge)}
                                            className="w-full bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white border-0 shadow-lg shadow-rose-500/20 font-semibold"
                                        >
                                            <Radio className="h-4 w-4 mr-2" />
                                            Enter Debate Room
                                        </Button>
                                    )}

                                    {isOwn && challenge.status === "open" && (
                                        <div className="flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/30 text-xs font-medium py-2.5">
                                            Awaiting Challenger…
                                        </div>
                                    )}

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
