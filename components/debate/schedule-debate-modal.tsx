"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface ScheduleDebateModalProps {
    open: boolean;
    opponentName: string;
    onClose: () => void;
    onConfirm: (scheduledAt: Date) => void;
}

const TIME_SLOTS = [
    { label: "Morning", time: "09:00", icon: "🌅" },
    { label: "Noon", time: "12:00", icon: "☀️" },
    { label: "Afternoon", time: "15:00", icon: "🌤" },
    { label: "Evening", time: "18:00", icon: "🌆" },
    { label: "Night", time: "20:00", icon: "🌙" },
];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function ScheduleDebateModal({ open, opponentName, onClose, onConfirm }: ScheduleDebateModalProps) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const todayIsThisMonth =
        today.getFullYear() === viewYear && today.getMonth() === viewMonth;

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
        setSelectedDay(null);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
        setSelectedDay(null);
    };

    const handleConfirm = () => {
        if (!selectedDay || !selectedSlot) return;
        const [h, m] = selectedSlot.split(":").map(Number);
        const scheduledAt = new Date(viewYear, viewMonth, selectedDay, h, m);
        toast.success(`Scheduled! ${opponentName} has been notified.`, {
            description: scheduledAt.toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            }),
            duration: 4000,
        });
        onConfirm(scheduledAt);
        setSelectedDay(null);
        setSelectedSlot(null);
    };

    const handleClose = () => {
        setSelectedDay(null);
        setSelectedSlot(null);
        onClose();
    };

    const canConfirm = !!selectedDay && !!selectedSlot;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] shadow-2xl">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

                    <div className="p-6 flex flex-col gap-5">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 ring-1 ring-sky-500/40">
                                    <Calendar className="h-4.5 w-4.5 text-sky-400" />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-bold text-white">
                                        Schedule Debate
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-white/40">
                                        vs {opponentName}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Mini Calendar */}
                        <div className="rounded-xl bg-white/5 border border-white/8 overflow-hidden">
                            {/* Month nav */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                                <button onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-semibold text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                                <button onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Day grid */}
                            <div className="p-3">
                                {/* Weekday headers */}
                                <div className="grid grid-cols-7 mb-1">
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                                        <div key={d} className="text-center text-[10px] font-medium text-white/30 py-1">{d}</div>
                                    ))}
                                </div>
                                {/* Days */}
                                <div className="grid grid-cols-7 gap-0.5">
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const isPast = todayIsThisMonth && day < today.getDate();
                                        const isToday = todayIsThisMonth && day === today.getDate();
                                        const isSelected = selectedDay === day;
                                        return (
                                            <button
                                                key={day}
                                                disabled={isPast}
                                                onClick={() => setSelectedDay(day)}
                                                className={cn(
                                                    "aspect-square w-full rounded-lg text-xs font-medium transition-all duration-150",
                                                    isPast && "text-white/15 cursor-not-allowed",
                                                    !isPast && !isSelected && "text-white/60 hover:bg-white/10 hover:text-white",
                                                    isToday && !isSelected && "text-sky-400 ring-1 ring-sky-500/40",
                                                    isSelected && "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                                                )}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Time slots */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Time Slot
                            </p>
                            <div className="grid grid-cols-5 gap-1.5">
                                {TIME_SLOTS.map((slot) => (
                                    <button
                                        key={slot.time}
                                        onClick={() => setSelectedSlot(slot.time)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 text-center transition-all duration-150 border",
                                            selectedSlot === slot.time
                                                ? "bg-sky-500/20 border-sky-500/50 text-sky-300 ring-1 ring-sky-500/30"
                                                : "bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/15"
                                        )}
                                    >
                                        <span className="text-base leading-none">{slot.icon}</span>
                                        <span className="text-[10px] font-medium">{slot.label}</span>
                                        <span className="text-[9px] text-white/40">{slot.time}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!canConfirm}
                                onClick={handleConfirm}
                                className="flex-1 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-sky-500/20"
                            >
                                <Bell className="h-4 w-4 mr-2" />
                                Confirm & Notify
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
