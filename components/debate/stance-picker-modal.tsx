"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swords, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebateCard } from "@/lib/models/debate-card";

interface StancePickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (role: "pro" | "con") => void;
    card: DebateCard | null;
}

export function StancePickerModal({ open, onClose, onSelect, card }: StancePickerModalProps) {
    if (!card) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md bg-[#0a0a18] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        Choose Your Side
                    </DialogTitle>
                    <DialogDescription className="text-white/50">
                        Select which stance you want to defend in this debate.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    {/* PRO Option */}
                    <button
                        onClick={() => onSelect("pro")}
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
                        onClick={() => onSelect("con")}
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

                <div className="mt-6 rounded-xl bg-white/5 p-4 border border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Debating Topic</p>
                    <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                        &quot;{card.title}&quot;
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="ghost" onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/5">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
