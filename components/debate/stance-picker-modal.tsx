"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swords, Shield, Bot, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebateCard } from "@/lib/models/debate-card";

interface StancePickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (role: "pro" | "con") => void;
    onRaiseChallenge?: (card: DebateCard) => void;
    card: DebateCard | null;
}

type PickerStep = "mode" | "stance";

export function StancePickerModal({ open, onClose, onSelect, onRaiseChallenge, card }: StancePickerModalProps) {
    const [step, setStep] = useState<PickerStep>("mode");

    if (!card) return null;

    const handleClose = () => {
        setStep("mode");
        onClose();
    };

    const handleModeSelect = (mode: "ai" | "real") => {
        if (mode === "ai") {
            setStep("stance");
        } else {
            // Real player → open raise challenge modal
            handleClose();
            onRaiseChallenge?.(card);
        }
    };

    const handleStanceSelect = (role: "pro" | "con") => {
        setStep("mode");
        onSelect(role);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="sm:max-w-md bg-[#0a0a18] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        {step === "mode" ? "How do you want to debate?" : "Choose Your Side"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                        {step === "mode"
                            ? "Face an AI opponent instantly, or challenge a real player."
                            : "Select which stance you want to defend in this debate."}
                    </DialogDescription>
                </DialogHeader>

                {/* ── Step 1: Mode selection ── */}
                {step === "mode" && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {/* Debate AI */}
                        <button
                            onClick={() => handleModeSelect("ai")}
                            className={cn(
                                "group relative flex flex-col items-center gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 transition-all",
                                "hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-500/10 active:scale-95"
                            )}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/30 transition-transform group-hover:scale-110">
                                <Bot className="h-8 w-8 text-violet-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-violet-300">Debate AI</h3>
                                <p className="mt-1 text-[10px] text-violet-400/60 uppercase tracking-widest">Instant Match</p>
                            </div>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Challenge Real Player */}
                        <button
                            onClick={() => handleModeSelect("real")}
                            className={cn(
                                "group relative flex flex-col items-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 transition-all",
                                "hover:border-rose-500/50 hover:bg-rose-500/10 hover:shadow-lg hover:shadow-rose-500/10 active:scale-95"
                            )}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 ring-1 ring-rose-500/30 transition-transform group-hover:scale-110">
                                <Users className="h-8 w-8 text-rose-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-rose-300">Real Player</h3>
                                <p className="mt-1 text-[10px] text-rose-400/60 uppercase tracking-widest">Raise Challenge</p>
                            </div>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                )}

                {/* ── Step 2: PRO / CON stance ── */}
                {step === "stance" && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {/* PRO Option */}
                        <button
                            onClick={() => handleStanceSelect("pro")}
                            className={cn(
                                "group relative flex flex-col items-center gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 transition-all",
                                "hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-500/10 active:scale-95"
                            )}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 ring-1 ring-violet-500/30 transition-transform group-hover:scale-110">
                                <Shield className="h-8 w-8 text-violet-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-violet-300">Supporter</h3>
                                <p className="mt-1 text-[10px] uppercase tracking-widest text-violet-400/60">PRO</p>
                            </div>
                        </button>

                        {/* CON Option */}
                        <button
                            onClick={() => handleStanceSelect("con")}
                            className={cn(
                                "group relative flex flex-col items-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 transition-all",
                                "hover:border-rose-500/50 hover:bg-rose-500/10 hover:shadow-lg hover:shadow-rose-500/10 active:scale-95"
                            )}
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 ring-1 ring-rose-500/30 transition-transform group-hover:scale-110">
                                <Swords className="h-8 w-8 text-rose-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-rose-300">Rebuttal</h3>
                                <p className="mt-1 text-[10px] uppercase tracking-widest text-rose-400/60">CON</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Topic & footer */}
                <div className="mt-4 rounded-xl bg-white/5 p-4 border border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Debating Topic</p>
                    <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                        &quot;{card.title}&quot;
                    </p>
                </div>

                <div className="flex justify-between pt-2">
                    {step === "stance" && (
                        <Button variant="ghost" onClick={() => setStep("mode")} className="text-white/40 hover:text-white hover:bg-white/5">
                            ← Back
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleClose} className="text-white/40 hover:text-white hover:bg-white/5 ml-auto">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
