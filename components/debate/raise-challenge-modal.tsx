"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { YouTubePlayer } from "@/components/debate/youtube-player";
import { suggestTopicsForVideo, type YoutubeChallengeData } from "@/lib/models/youtube-challenge";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils";
import { Link, Sparkles, ChevronRight, Check, Swords, Shield } from "lucide-react";

interface RaiseChallengeModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<YoutubeChallengeData, "id" | "createdAt" | "status" | "raisedBy">) => void;
}

type Step = 1 | 2 | 3;

export function RaiseChallengeModal({ open, onClose, onSubmit }: RaiseChallengeModalProps) {
    const [step, setStep] = useState<Step>(1);
    const [url, setUrl] = useState("");
    const [validVideoId, setValidVideoId] = useState<string | null>(null);
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [customTopic, setCustomTopic] = useState("");
    const [description, setDescription] = useState("");
    const [myRole, setMyRole] = useState<"pro" | "con">("pro");

    // Validate URL and show preview instantly
    useEffect(() => {
        const id = extractYouTubeId(url);
        setValidVideoId(id);
        if (id) {
            setSuggestedTopics(suggestTopicsForVideo(url));
        } else {
            setSuggestedTopics([]);
        }
    }, [url]);

    const finalTopic = selectedTopic || customTopic.trim();

    const handleClose = () => {
        setStep(1);
        setUrl("");
        setValidVideoId(null);
        setSuggestedTopics([]);
        setSelectedTopic("");
        setCustomTopic("");
        setDescription("");
        setMyRole("pro");
        onClose();
    };

    const handleSubmit = () => {
        if (!validVideoId || !finalTopic) return;
        onSubmit({
            videoUrl: url,
            topic: finalTopic,
            description: description.trim() || `A challenge raised from a YouTube video. Join and debate: "${finalTopic}"`,
            raisedByRole: myRole,
        });
        handleClose();
    };

    const canProceed = !!validVideoId && !!finalTopic;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] shadow-2xl">
                    {/* Glowing header accent */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

                    <div className="p-6">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/40">
                                    <Swords className="h-5 w-5 text-violet-400" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold text-white">
                                        Raise a YouTube Challenge
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-white/50 mt-0.5">
                                        Step {step} of 3 — {step === 1 ? "Pick a video & topic" : step === 2 ? "Choose your side" : "Add details & launch"}
                                    </DialogDescription>
                                </div>
                            </div>
                            {/* Step indicator */}
                            <div className="flex gap-2 mt-3">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={cn(
                                            "h-1 flex-1 rounded-full transition-all duration-300",
                                            s <= step ? "bg-violet-500" : "bg-white/10"
                                        )}
                                    />
                                ))}
                            </div>
                        </DialogHeader>

                        {step === 1 && (
                            <div className="flex flex-col gap-5">
                                {/* URL Input */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                        <Link className="h-3.5 w-3.5 text-violet-400" />
                                        YouTube Video Link
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="https://youtube.com/watch?v=..."
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50 pr-10"
                                        />
                                        {validVideoId && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Video preview */}
                                {validVideoId && (
                                    <div className="rounded-xl overflow-hidden ring-1 ring-violet-500/30 shadow-lg shadow-violet-500/10">
                                        <YouTubePlayer url={url} title="Challenge Video Preview" />
                                    </div>
                                )}

                                {/* AI Topic Suggestions */}
                                {suggestedTopics.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                            AI-Suggested Topics
                                        </Label>
                                        <div className="flex flex-col gap-2">
                                            {suggestedTopics.map((topic) => (
                                                <button
                                                    key={topic}
                                                    onClick={() => {
                                                        setSelectedTopic(topic);
                                                        setCustomTopic("");
                                                    }}
                                                    className={cn(
                                                        "text-left rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border",
                                                        selectedTopic === topic
                                                            ? "bg-violet-500/20 border-violet-500/60 text-white ring-1 ring-violet-500/40"
                                                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className={cn(
                                                            "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
                                                            selectedTopic === topic ? "border-violet-400 bg-violet-500" : "border-white/20"
                                                        )}>
                                                            {selectedTopic === topic && <Check className="h-2.5 w-2.5 text-white" />}
                                                        </div>
                                                        {topic}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Custom topic */}
                                {validVideoId && (
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-white/50">
                                            Or write your own topic
                                        </Label>
                                        <Input
                                            placeholder="e.g. Should AI moderate online content?"
                                            value={customTopic}
                                            onChange={(e) => {
                                                setCustomTopic(e.target.value);
                                                setSelectedTopic("");
                                            }}
                                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                                        />
                                    </div>
                                )}

                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!validVideoId || !finalTopic}
                                    className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 mt-2"
                                >
                                    Continue
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}

                        {/* ── Step 2: Choose your side ── */}
                        {step === 2 && (
                            <div className="flex flex-col gap-5">
                                <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-3">
                                    <p className="text-xs text-violet-400 mb-1">Debate Topic</p>
                                    <p className="text-sm font-semibold text-white">{finalTopic}</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-violet-400" />
                                        Choose Your Side
                                    </p>
                                    <p className="text-xs text-white/40">Pick which position you want to argue in this debate.</p>

                                    <div className="grid grid-cols-2 gap-3">
                                        {/* PRO / Supporter */}
                                        <button
                                            onClick={() => setMyRole("pro")}
                                            className={cn(
                                                "flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200",
                                                myRole === "pro"
                                                    ? "bg-violet-500/15 border-violet-500/50 ring-1 ring-violet-500/40 shadow-lg shadow-violet-500/10"
                                                    : "bg-white/3 border-white/10 hover:bg-white/8 hover:border-white/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-all",
                                                myRole === "pro" ? "bg-violet-500/25 ring-violet-500/50" : "bg-white/5 ring-white/10"
                                            )}>
                                                <Shield className={cn("h-6 w-6", myRole === "pro" ? "text-violet-400" : "text-white/30")} />
                                            </div>
                                            <div className="text-center">
                                                <p className={cn("text-sm font-bold", myRole === "pro" ? "text-violet-300" : "text-white/50")}>Supporter</p>
                                                <p className="text-[11px] text-white/30 mt-0.5">PRO — Argue in favour</p>
                                            </div>
                                            {myRole === "pro" && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>

                                        {/* CON / Rebuttal */}
                                        <button
                                            onClick={() => setMyRole("con")}
                                            className={cn(
                                                "flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200",
                                                myRole === "con"
                                                    ? "bg-rose-500/15 border-rose-500/50 ring-1 ring-rose-500/40 shadow-lg shadow-rose-500/10"
                                                    : "bg-white/3 border-white/10 hover:bg-white/8 hover:border-white/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-all",
                                                myRole === "con" ? "bg-rose-500/25 ring-rose-500/50" : "bg-white/5 ring-white/10"
                                            )}>
                                                <Swords className={cn("h-6 w-6", myRole === "con" ? "text-rose-400" : "text-white/30")} />
                                            </div>
                                            <div className="text-center">
                                                <p className={cn("text-sm font-bold", myRole === "con" ? "text-rose-300" : "text-white/50")}>Rebuttal</p>
                                                <p className="text-[11px] text-white/30 mt-0.5">CON — Argue against</p>
                                            </div>
                                            {myRole === "con" && (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => setStep(3)}
                                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                    >
                                        Continue <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col gap-5">
                                {/* Selected topic chip */}
                                <div className="rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-3">
                                    <p className="text-xs text-violet-400 mb-1">Debate Topic</p>
                                    <p className="text-sm font-semibold text-white">{finalTopic}</p>
                                </div>

                                {/* Role summary */}
                                <div className={cn(
                                    "flex items-center gap-3 rounded-xl border px-4 py-3",
                                    myRole === "pro" ? "bg-violet-500/10 border-violet-500/30" : "bg-rose-500/10 border-rose-500/30"
                                )}>
                                    <Shield className={cn("h-4 w-4 flex-shrink-0", myRole === "pro" ? "text-violet-400" : "text-rose-400")} />
                                    <div>
                                        <p className={cn("text-xs font-bold", myRole === "pro" ? "text-violet-300" : "text-rose-300")}>
                                            You are debating as: {myRole === "pro" ? "Supporter (PRO)" : "Rebuttal (CON)"}
                                        </p>
                                        <p className="text-[11px] text-white/40">
                                            {myRole === "pro" ? "You will argue in favour of this topic." : "You will argue against this topic."}
                                        </p>
                                    </div>
                                </div>

                                {/* Optional description */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-sm font-medium text-white/80">
                                        Challenge Description{" "}
                                        <span className="text-white/40 font-normal">(optional)</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Give challengers some context about why this is worth debating..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 mt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(2)}
                                        className="flex-1 bg-transparent border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canProceed}
                                        className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 border-0"
                                    >
                                        <Swords className="h-4 w-4 mr-2" />
                                        Launch Challenge
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
