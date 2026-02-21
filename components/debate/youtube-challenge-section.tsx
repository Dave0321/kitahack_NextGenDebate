"use client";

import { YoutubeChallenge } from "@/lib/models/youtube-challenge";
import { YoutubeChallengeCard } from "./youtube-challenge-card";
import { Swords, Plus } from "lucide-react";

interface YoutubeChallengeSectionProps {
    challenges: YoutubeChallenge[];
    currentUser: string;
    onRaiseChallenge: () => void;
    onTapCard: (challenge: YoutubeChallenge) => void;
}

export function YoutubeDebateSection({
    challenges,
    currentUser,
    onRaiseChallenge,
    onTapCard,
}: YoutubeChallengeSectionProps) {
    return (
        <section className="flex flex-col gap-4">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 lg:px-8">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                        <Swords className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-foreground leading-tight">
                            YouTube Debate Challenges
                        </h2>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                            Raise a topic from any video · Find your match
                        </p>
                    </div>
                </div>

                {/* Raise challenge button */}
                <button
                    onClick={onRaiseChallenge}
                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:shadow-violet-500/50 hover:scale-105 active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-200" />
                    Raise Challenge
                </button>
            </div>

            {/* Cards */}
            {challenges.length === 0 ? (
                <div className="mx-4 lg:mx-8">
                    <button
                        onClick={onRaiseChallenge}
                        className="group flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 py-10 transition-all hover:border-violet-500/50 hover:bg-violet-500/10"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/30 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300">
                            <Swords className="h-6 w-6 text-violet-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                                No challenges yet — be the first!
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Paste any YouTube link and raise a debate topic
                            </p>
                        </div>
                        <span className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20">
                            <Plus className="h-3.5 w-3.5" />
                            Raise a Challenge
                        </span>
                    </button>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto px-4 pb-3 hide-scrollbar lg:px-8">
                    {challenges.map((ch) => (
                        <YoutubeChallengeCard
                            key={ch.id}
                            challenge={ch}
                            isOwn={ch.raisedBy === currentUser}
                            onClick={() => onTapCard(ch)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
