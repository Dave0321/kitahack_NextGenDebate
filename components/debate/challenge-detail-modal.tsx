"use client";

import { useState } from "react";
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
    MessageSquare,
    X,
    ThumbsUp,
    ThumbsDown,
    Minus,
    Vote,
    Eye,
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

// Deterministic seed vote counts from challenge data
function useVoteData(challenge: YoutubeChallenge) {
    const seed = challenge.topic.length + challenge.raisedBy.length;
    const basePro = 40 + (seed % 30);        // 40–69
    const baseCon = 20 + ((seed * 3) % 25);  // 20–44
    const baseNeutral = 100 - basePro - baseCon;
    return { basePro, baseCon, baseNeutral: Math.max(5, baseNeutral) };
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
    const [userVote, setUserVote] = useState<"pro" | "neutral" | "con" | null>(null);

    if (!challenge) return null;

    const canEnter = challenge.status === "scheduled" || challenge.status === "live";
    const canAccept = !isOwn && challenge.status === "open";
    const cfg = STATUS_CFG[challenge.status];
    const StatusIcon = cfg.icon;

    const { basePro, baseCon, baseNeutral } = useVoteData(challenge);

    // Add user's vote to the totals
    const proVotes = basePro + (userVote === "pro" ? 1 : 0);
    const conVotes = baseCon + (userVote === "con" ? 1 : 0);
    const neutralVotes = baseNeutral + (userVote === "neutral" ? 1 : 0);
    const totalVotes = proVotes + conVotes + neutralVotes;

    const proPct = Math.round((proVotes / totalVotes) * 100);
    const conPct = Math.round((conVotes / totalVotes) * 100);
    const neutralPct = 100 - proPct - conPct;

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

                            {/* Left: Community Voting (3 cols) */}
                            <div className="col-span-3 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Vote className="h-3.5 w-3.5 text-violet-400" />
                                    <span className="text-xs font-semibold text-violet-300 uppercase tracking-wide">Community Vote</span>
                                    {userVote && (
                                        <span className="text-[10px] text-white/30">· Your vote recorded</span>
                                    )}
                                </div>

                                {/* Vote buttons */}
                                {!userVote ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setUserVote("pro")}
                                            className="flex flex-col items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/8 px-2 py-3 text-violet-300 hover:bg-violet-500/15 hover:border-violet-500/40 transition-all active:scale-95"
                                        >
                                            <ThumbsUp className="h-5 w-5" />
                                            <span className="text-[11px] font-bold">PRO</span>
                                        </button>
                                        <button
                                            onClick={() => setUserVote("neutral")}
                                            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-500/20 bg-slate-500/8 px-2 py-3 text-slate-300 hover:bg-slate-500/15 hover:border-slate-500/40 transition-all active:scale-95"
                                        >
                                            <Minus className="h-5 w-5" />
                                            <span className="text-[11px] font-bold">Neutral</span>
                                        </button>
                                        <button
                                            onClick={() => setUserVote("con")}
                                            className="flex flex-col items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/8 px-2 py-3 text-rose-300 hover:bg-rose-500/15 hover:border-rose-500/40 transition-all active:scale-95"
                                        >
                                            <ThumbsDown className="h-5 w-5" />
                                            <span className="text-[11px] font-bold">CON</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2.5 flex items-center gap-2">
                                        {userVote === "pro" && <ThumbsUp className="h-4 w-4 text-violet-400" />}
                                        {userVote === "neutral" && <Minus className="h-4 w-4 text-slate-400" />}
                                        {userVote === "con" && <ThumbsDown className="h-4 w-4 text-rose-400" />}
                                        <span className="text-xs text-white/60">
                                            You voted <span className={cn("font-bold",
                                                userVote === "pro" ? "text-violet-300" : userVote === "con" ? "text-rose-300" : "text-slate-300"
                                            )}>{userVote.toUpperCase()}</span>
                                        </span>
                                        <button onClick={() => setUserVote(null)} className="ml-auto text-[10px] text-white/30 hover:text-white/60 transition-colors">
                                            Change
                                        </button>
                                    </div>
                                )}

                                {/* Vote distribution bar */}
                                <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-2">
                                    <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Vote Distribution</p>
                                    <div className="flex h-2.5 w-full overflow-hidden rounded-full gap-0.5">
                                        <div
                                            className="bg-violet-500 rounded-l-full transition-all duration-500"
                                            style={{ width: `${proPct}%` }}
                                        />
                                        <div
                                            className="bg-slate-500 transition-all duration-500"
                                            style={{ width: `${neutralPct}%` }}
                                        />
                                        <div
                                            className="bg-rose-500 rounded-r-full transition-all duration-500"
                                            style={{ width: `${conPct}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-violet-400 font-semibold">PRO {proPct}%</span>
                                        <span className="text-slate-400">Neutral {neutralPct}%</span>
                                        <span className="text-rose-400 font-semibold">CON {conPct}%</span>
                                    </div>
                                    <p className="text-[10px] text-white/25 text-center">{totalVotes} votes cast</p>
                                </div>

                                {/* Key discussion points */}
                                <div className="rounded-xl bg-white/5 border border-white/8 p-3 flex flex-col gap-2">
                                    <p className="text-[11px] font-medium text-white/50 uppercase tracking-wide flex items-center gap-1.5">
                                        <MessageSquare className="h-3 w-3" /> Key Discussion Points
                                    </p>
                                    <ul className="flex flex-col gap-1.5">
                                        {[
                                            "Economic implications are central to this debate.",
                                            "Public opinion is closely divided on this topic.",
                                            "Historical precedents show mixed outcomes.",
                                        ].map((pt, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                                                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
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
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white border-0 shadow-lg shadow-rose-500/20 font-semibold text-[11px] px-1"
                                        >
                                            <Eye className="h-3 w-3 mr-1 shrink-0" />
                                            <span className="truncate">Enter Room · Watch Live</span>
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
