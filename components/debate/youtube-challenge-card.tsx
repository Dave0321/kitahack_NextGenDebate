"use client";

import { YoutubeChallenge } from "@/lib/models/youtube-challenge";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils";
import { Swords, Clock, Calendar, Zap, Radio, User } from "lucide-react";

interface YoutubeChallengeCardProps {
    challenge: YoutubeChallenge;
    isOwn: boolean;
    onClick: () => void;
}

const STATUS_CONFIG = {
    open: {
        label: "Seeking Challenger",
        icon: Zap,
        className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        pulse: true,
    },
    matched: {
        label: "Matched",
        icon: Swords,
        className: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        pulse: false,
    },
    scheduled: {
        label: "Scheduled",
        icon: Calendar,
        className: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        pulse: false,
    },
    live: {
        label: "Live Now",
        icon: Radio,
        className: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        pulse: true,
    },
};

export function YoutubeChallengeCard({ challenge, isOwn, onClick }: YoutubeChallengeCardProps) {
    const thumbnail = getYouTubeThumbnail(challenge.videoUrl, "medium");
    const config = STATUS_CONFIG[challenge.status];
    const StatusIcon = config.icon;

    const ctaLabel =
        challenge.status === "live"
            ? "Enter Room"
            : challenge.status === "scheduled"
                ? "Enter Room"
                : isOwn
                    ? "Awaiting Challenger…"
                    : "Accept & Debate";

    const ctaDisabled = isOwn && challenge.status === "open";

    return (
        <button
            onClick={onClick}
            disabled={ctaDisabled}
            className={cn(
                "group relative flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-2xl border transition-all duration-300",
                "bg-gradient-to-b from-[#141425] to-[#0d0d1a] border-white/8",
                "hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1",
                ctaDisabled && "cursor-default hover:translate-y-0 hover:shadow-none hover:border-white/8"
            )}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden">
                {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={thumbnail}
                        alt={challenge.topic}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5">
                        <Swords className="h-12 w-12 text-white/10" />
                    </div>
                )}
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/40 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-3 left-3">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm",
                            config.className
                        )}
                    >
                        {config.pulse && (
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-current" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                            </span>
                        )}
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                    </span>
                </div>

                {/* Own badge */}
                {isOwn && (
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm">
                            <User className="h-2.5 w-2.5" />
                            You
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                {/* Topic */}
                <p className="text-sm font-semibold text-white leading-snug line-clamp-2 text-left">
                    {challenge.topic}
                </p>

                {/* Raiser */}
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-violet-500/30">
                        <User className="h-3 w-3 text-violet-400" />
                    </div>
                    <span className="text-xs text-white/50">
                        {isOwn ? "Raised by You" : `by ${challenge.raisedBy}`}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-white/30">
                        <Clock className="h-2.5 w-2.5" />
                        {challenge.getTimeAgo()}
                    </span>
                </div>

                {/* Separator */}
                <div className="h-px bg-white/5" />

                {/* CTA */}
                <div
                    className={cn(
                        "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                        ctaDisabled
                            ? "bg-white/5 text-white/25"
                            : challenge.status === "live"
                                ? "bg-rose-500/20 text-rose-300 group-hover:bg-rose-500/30"
                                : challenge.status === "scheduled"
                                    ? "bg-sky-500/20 text-sky-300 group-hover:bg-sky-500/30"
                                    : "bg-violet-500/20 text-violet-300 group-hover:bg-violet-500/30"
                    )}
                >
                    {!ctaDisabled && <Swords className="h-3.5 w-3.5" />}
                    {ctaLabel}
                </div>
            </div>
        </button>
    );
}
