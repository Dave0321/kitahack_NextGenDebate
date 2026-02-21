"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { YoutubeChallenge } from "@/lib/models/youtube-challenge";
import { YouTubePlayer } from "@/components/debate/youtube-player";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Timer,
    Swords,
    Crown,
    Shield,
    Send,
    Sparkles,
    ChevronDown,
    Flag,
    Lightbulb,
    BarChart2,
    Zap,
    Scale,
} from "lucide-react";

interface DebateRoomPageProps {
    challenge: YoutubeChallenge;
    currentUser: string;
    onExit: () => void;
    userRole?: "pro" | "con"; // externally selected stance
}

interface Message {
    id: string;
    player: "pro" | "con";
    name: string;
    text: string;
    timestamp: Date;
    score?: number; // AI quality score 1-10
}

const ROUND_SECONDS = 300; // 5 min per round

// Simulated AI analysis of argument quality
function scoreArgument(text: string): number {
    const words = text.trim().split(/\s+/).length;
    const hasClaims = /because|therefore|however|evidence|studies|research|data|fact/i.test(text);
    const hasCounterpoint = /but|although|despite|while|whereas|on the other hand/i.test(text);
    let score = Math.min(10, Math.max(1, Math.floor(words / 8)));
    if (hasClaims) score = Math.min(10, score + 2);
    if (hasCounterpoint) score = Math.min(10, score + 1);
    return score;
}

const AI_PROMPTS = [
    "Support your claim with specific evidence or data.",
    "Address the strongest opposing argument.",
    "What are the societal implications of this stance?",
    "Can you cite a real-world example?",
    "How does this align with established research?",
    "Anticipate and refute a likely counterpoint.",
];

export function DebateRoomPage({ challenge, currentUser, onExit, userRole }: DebateRoomPageProps) {
    const isPlayerOne = challenge.raisedBy === currentUser;
    const myName = currentUser;
    const opponentName = isPlayerOne ? (challenge.acceptedBy ?? "Challenger") : challenge.raisedBy;
    const myRole: "pro" | "con" = userRole ?? (isPlayerOne ? "pro" : "con");
    const oppRole: "pro" | "con" = myRole === "pro" ? "con" : "pro";

    // Timer
    const [seconds, setSeconds] = useState(ROUND_SECONDS);
    const [timerRunning, setTimerRunning] = useState(true);
    const [round, setRound] = useState(1);

    useEffect(() => {
        if (!timerRunning) return;
        if (seconds <= 0) {
            setTimerRunning(false);
            return;
        }
        const id = setInterval(() => setSeconds((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [timerRunning, seconds]);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    const timerColor =
        seconds > 120 ? "text-emerald-300" : seconds > 60 ? "text-amber-300" : "text-rose-400";
    const timerBg =
        seconds > 120 ? "bg-emerald-500/10 border-emerald-500/20" : seconds > 60 ? "bg-amber-500/10 border-amber-500/20" : "bg-rose-500/10 border-rose-500/20 animate-pulse";

    // Messages
    const [messages, setMessages] = useState<Message[]>([]);
    const [myInput, setMyInput] = useState("");
    const [oppInput, setOppInput] = useState("");
    const [myTyping, setMyTyping] = useState(false);
    const [oppTyping, setOppTyping] = useState(false);
    const [activeTip, setActiveTip] = useState<string | null>(null);

    const myMessagesEndRef = useRef<HTMLDivElement>(null);
    const oppMessagesEndRef = useRef<HTMLDivElement>(null);
    const oppTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const myMessages = messages.filter((m) => m.player === myRole);
    const oppMessages = messages.filter((m) => m.player === oppRole);

    const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = useCallback(
        (player: "pro" | "con", name: string, text: string) => {
            if (!text.trim()) return;
            const score = scoreArgument(text);
            const msg: Message = {
                id: `${Date.now()}-${player}`,
                player,
                name,
                text: text.trim(),
                timestamp: new Date(),
                score,
            };
            setMessages((prev) => [...prev, msg]);
            return msg;
        },
        []
    );

    const handleMySend = () => {
        if (!myInput.trim()) return;
        sendMessage(myRole, myName, myInput);
        setMyInput("");

        // Simulate opponent thinking and replying
        setOppTyping(true);
        if (oppTimerRef.current) clearTimeout(oppTimerRef.current);
        oppTimerRef.current = setTimeout(() => {
            const replies = [
                "I understand your point, but consider this: the data suggests otherwise when examined in context.",
                "That's an interesting perspective. However, evidence points towards a more nuanced conclusion.",
                "While true to some extent, the broader implications contradict your argument significantly.",
                "I'd push back on that — independent studies have consistently shown the opposite.",
                "You raise a fair point, but this overlooks a critical factor that fundamentally changes the analysis.",
            ];
            const reply = replies[Math.floor(Math.random() * replies.length)];
            sendMessage(oppRole, opponentName, reply);
            setOppTyping(false);
        }, 1500 + Math.random() * 2000);

        // Random AI tip
        const tip = AI_PROMPTS[Math.floor(Math.random() * AI_PROMPTS.length)];
        setActiveTip(tip);
        setTimeout(() => setActiveTip(null), 5000);
    };

    useEffect(() => {
        scrollToBottom(myMessagesEndRef);
    }, [myMessages]);

    useEffect(() => {
        scrollToBottom(oppMessagesEndRef);
    }, [oppMessages]);

    // PRO/CON scores
    const proScore = messages
        .filter((m) => m.player === "pro")
        .reduce((acc, m) => acc + (m.score ?? 0), 0);
    const conScore = messages
        .filter((m) => m.player === "con")
        .reduce((acc, m) => acc + (m.score ?? 0), 0);
    const totalScore = proScore + conScore || 1;

    const nextRound = () => {
        setRound((r) => r + 1);
        setSeconds(ROUND_SECONDS);
        setTimerRunning(true);
    };

    return (
        <div className="h-screen bg-gradient-to-b from-[#07070e] via-[#0c0c1a] to-[#0f0f22] flex flex-col overflow-hidden">

            {/* ── Top bar ─────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/8 bg-[#09091a]/90 backdrop-blur-xl px-4 lg:px-6">
                <button
                    onClick={onExit}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex-shrink-0"
                    aria-label="Exit"
                >
                    <ArrowLeft className="h-4 w-4 text-white/70" />
                </button>

                {/* Title */}
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-400/70">
                        Debate Room · Round {round}
                    </p>
                    <h1 className="text-sm font-semibold text-white/90 truncate leading-tight">
                        {challenge.topic}
                    </h1>
                </div>

                {/* Live score bar */}
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-[10px] font-bold text-violet-400">PRO {proScore}</span>
                    <div className="w-24 h-1.5 rounded-full overflow-hidden bg-white/10 flex">
                        <div
                            className="bg-violet-500 transition-all duration-700"
                            style={{ width: `${(proScore / totalScore) * 100}%` }}
                        />
                        <div
                            className="bg-rose-500 transition-all duration-700"
                            style={{ width: `${(conScore / totalScore) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-rose-400">CON {conScore}</span>
                </div>

                {/* Timer */}
                <div className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition-all cursor-pointer", timerBg)}
                    onClick={() => setTimerRunning((v) => !v)}>
                    <Timer className={cn("h-3.5 w-3.5", timerColor)} />
                    <span className={cn("text-sm font-mono font-bold", timerColor)}>
                        {formatTime(seconds)}
                    </span>
                </div>

                {seconds === 0 && (
                    <button
                        onClick={nextRound}
                        className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                    >
                        <Zap className="h-3.5 w-3.5" />
                        Next Round
                    </button>
                )}
            </header>

            {/* ── AI tip toast ─────────────────────────────────────────────────── */}
            <div
                className={cn(
                    "fixed top-16 left-1/2 z-50 -translate-x-1/2 transition-all duration-300",
                    activeTip ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                )}
            >
                <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-[#13132a]/95 backdrop-blur px-4 py-2 shadow-xl shadow-violet-500/20">
                    <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                    <p className="text-xs text-white/80">{activeTip}</p>
                </div>
            </div>

            {/* ── Main 3-column arena ──────────────────────────────────────────── */}
            <main className="flex flex-1 gap-0 overflow-hidden">

                {/* ── LEFT: PRO player ─────────────────────────────────────────── */}
                <PlayerColumn
                    name={myName}
                    role="pro"
                    isMe
                    messages={myMessages}
                    input={myInput}
                    onInputChange={setMyInput}
                    onSend={handleMySend}
                    messagesEndRef={myMessagesEndRef}
                    disabled={myInput.trim().length === 0}
                    isTyping={myTyping}
                />

                {/* ── CENTER: Resource + scoreboard ────────────────────────────── */}
                <div className="hidden lg:flex flex-col w-[36%] min-w-0 border-x border-white/8 bg-[#0a0a18] overflow-y-auto">
                    {/* VS header */}
                    <div className="flex items-center justify-center gap-3 py-3 border-b border-white/8">
                        <span className="text-xs font-bold text-violet-400 tracking-widest">PRO</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/40">
                            <Swords className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-rose-400 tracking-widest">CON</span>
                    </div>

                    {/* Video */}
                    <div className="p-3 border-b border-white/8">
                        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                            Reference Source
                        </p>
                        <div className="rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">
                            <YouTubePlayer url={challenge.videoUrl} title={challenge.topic} />
                        </div>
                    </div>

                    {/* Topic */}
                    <div className="p-3 border-b border-white/8">
                        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
                            Topic
                        </p>
                        <p className="text-sm font-semibold text-white/90 leading-snug">{challenge.topic}</p>
                    </div>

                    {/* Live argument score */}
                    <div className="p-3 flex flex-col gap-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 flex items-center gap-1.5">
                            <BarChart2 className="h-3 w-3" /> Argument Strength
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="w-10 text-right text-xs font-bold text-violet-400">{proScore}</span>
                            <div className="flex-1 h-3 rounded-full overflow-hidden bg-white/5 flex gap-0.5">
                                <div
                                    className="bg-gradient-to-r from-violet-600 to-violet-400 rounded-l-full transition-all duration-700"
                                    style={{ width: `${(proScore / totalScore) * 100}%` }}
                                />
                                <div
                                    className="bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-700"
                                    style={{ width: `${(conScore / totalScore) * 100}%` }}
                                />
                            </div>
                            <span className="w-10 text-xs font-bold text-rose-400">{conScore}</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-white/30 px-12">
                            <span>PRO</span>
                            <span>CON</span>
                        </div>
                    </div>

                    {/* ── AI Judge Panel ────────────────────────── */}
                    <JudgePanel proScore={proScore} conScore={conScore} totalMessages={messages.length} />

                    {/* Argument count */}
                    <div className="mt-auto p-3 border-t border-white/8 grid grid-cols-2 gap-2">
                        {[
                            { label: "PRO Arguments", val: myMessages.length, color: "text-violet-400" },
                            { label: "CON Arguments", val: oppMessages.length, color: "text-rose-400" },
                        ].map(({ label, val, color }) => (
                            <div key={label} className="rounded-xl bg-white/4 border border-white/8 p-2.5 text-center">
                                <p className={cn("text-xl font-bold", color)}>{val}</p>
                                <p className="text-[9px] text-white/30">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* End debate */}
                    <div className="p-3">
                        <Button
                            onClick={onExit}
                            variant="outline"
                            className="w-full bg-transparent border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/50 transition-all text-xs"
                        >
                            <Flag className="h-3.5 w-3.5 mr-2" />
                            Forfeit Debate
                        </Button>
                    </div>
                </div>

                {/* ── RIGHT: CON player ────────────────────────────────────────── */}
                <PlayerColumn
                    name={opponentName}
                    role="con"
                    isMe={false}
                    messages={oppMessages}
                    input={oppInput}
                    onInputChange={setOppInput}
                    onSend={() => {
                        sendMessage(oppRole, opponentName, oppInput);
                        setOppInput("");
                    }}
                    messagesEndRef={oppMessagesEndRef}
                    disabled={oppInput.trim().length === 0}
                    isTyping={oppTyping}
                />
            </main>

            {/* ── Mobile center panel (collapsed at bottom) ─────────────────── */}
            <div className="lg:hidden border-t border-white/8 bg-[#0a0a18] px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-violet-400">PRO {proScore}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/10 flex">
                        <div className="bg-violet-500" style={{ width: `${(proScore / totalScore) * 100}%` }} />
                        <div className="bg-rose-500" style={{ width: `${(conScore / totalScore) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-rose-400">CON {conScore}</span>
                </div>
                <Button onClick={onExit} variant="outline" size="sm" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs">
                    <Flag className="h-3.5 w-3.5 mr-1" /> Forfeit
                </Button>
            </div>
        </div>
    );
}

// ── Judge Panel ────────────────────────────────────────────────────────────

const JUDGE_COMMENTS_NEUTRAL = [
    "Both sides are presenting strong arguments. The debate hinges on concrete evidence.",
    "We\'re looking for clear, evidence-backed reasoning. Stay on point.",
    "A balanced start. Push deeper into the implications of each claim.",
    "Logic and structure will determine the winner here. Keep arguments tight.",
];
const JUDGE_COMMENTS_PRO_LEAD = [
    "PRO currently presents a more structured case. CON must raise the stakes.",
    "PRO\'s evidence is compelling. CON needs to address these points directly.",
    "PRO is leading on argument quality. CON — counterpoint now, or concede ground.",
];
const JUDGE_COMMENTS_CON_LEAD = [
    "CON is dismantling PRO\'s framework effectively. PRO needs a stronger rebuttal.",
    "CON\'s counterpoints are landing. PRO must reinforce their core premise.",
    "CON leads on density and refutation. PRO — respond to their strongest point.",
];

function JudgePanel({ proScore, conScore, totalMessages }: { proScore: number; conScore: number; totalMessages: number }) {
    const [commentIdx, setCommentIdx] = useState(0);
    const [gavel, setGavel] = useState(false);

    const diff = proScore - conScore;
    const pool = totalMessages === 0
        ? JUDGE_COMMENTS_NEUTRAL
        : diff > 2 ? JUDGE_COMMENTS_PRO_LEAD
            : diff < -2 ? JUDGE_COMMENTS_CON_LEAD
                : JUDGE_COMMENTS_NEUTRAL;

    useEffect(() => {
        const id = setInterval(() => {
            setGavel(true);
            setTimeout(() => setGavel(false), 600);
            setCommentIdx((i) => (i + 1) % pool.length);
        }, 6000);
        return () => clearInterval(id);
    }, [pool.length]);

    return (
        <div className="mx-3 mb-3 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-amber-900/5 overflow-hidden">
            {/* Judge header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/15">
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
                    <Scale
                        className={cn("h-4 w-4 text-amber-400 transition-transform duration-300", gavel ? "scale-110 rotate-6" : "")}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">AI Judge</p>
                    <p className="text-[9px] text-white/30">Impartial Analysis Engine</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                    <span className="text-[9px] font-bold text-rose-400 tracking-widest">LIVE</span>
                </div>
            </div>

            {/* Verdict area */}
            <div className="px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-white/65 italic min-h-[3rem]">
                    &ldquo;{pool[commentIdx % pool.length]}&rdquo;
                </p>
            </div>

            {/* Scoreboard */}
            <div className="flex items-center gap-0 border-t border-amber-500/10">
                <div className={cn(
                    "flex-1 flex flex-col items-center py-2 transition-all",
                    diff > 0 ? "bg-violet-500/10" : "bg-transparent"
                )}>
                    <p className="text-base font-bold tabular-nums text-violet-400">{proScore}</p>
                    <p className="text-[9px] text-white/30">{diff > 0 ? "⬆ " : ""}PRO</p>
                </div>
                <div className="flex flex-col items-center justify-center w-8">
                    <Scale className="h-3.5 w-3.5 text-amber-400/50" />
                </div>
                <div className={cn(
                    "flex-1 flex flex-col items-center py-2 transition-all",
                    diff < 0 ? "bg-rose-500/10" : "bg-transparent"
                )}>
                    <p className="text-base font-bold tabular-nums text-rose-400">{conScore}</p>
                    <p className="text-[9px] text-white/30">CON{diff < 0 ? " ⬆" : ""}</p>
                </div>
            </div>
        </div>
    );
}

// ── Player column component ────────────────────────────────────────────────

interface PlayerColumnProps {
    name: string;
    role: "pro" | "con";
    isMe: boolean;
    messages: Message[];
    input: string;
    onInputChange: (v: string) => void;
    onSend: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    disabled: boolean;
    isTyping?: boolean;
}

function PlayerColumn({
    name,
    role,
    isMe,
    messages,
    input,
    onInputChange,
    onSend,
    messagesEndRef,
    disabled,
    isTyping,
}: PlayerColumnProps) {
    const isPro = role === "pro";
    const accent = isPro
        ? { bg: "bg-violet-500/10", border: "border-violet-500/25", text: "text-violet-300", ring: "ring-violet-500/40", badge: "bg-violet-500/20 text-violet-300", bubble: "bg-violet-500/15 border-violet-500/20", btn: "bg-violet-600 hover:bg-violet-500 shadow-violet-500/30" }
        : { bg: "bg-rose-500/10", border: "border-rose-500/25", text: "text-rose-300", ring: "ring-rose-500/40", badge: "bg-rose-500/20 text-rose-300", bubble: "bg-rose-500/15 border-rose-500/20", btn: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/30" };

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) onSend();
        }
    };

    return (
        <div className={cn("flex flex-1 flex-col border-r border-white/8 last:border-r-0 min-w-0 h-full overflow-hidden", isPro ? "" : "")}>

            {/* Player header */}
            <div className={cn("flex items-center gap-3 px-4 py-3 border-b border-white/8", accent.bg)}>
                <div className={cn("relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1", `ring-1 ${accent.ring}`, isPro ? "bg-violet-500/20" : "bg-rose-500/20")}>
                    <Crown className={cn("h-5 w-5", accent.text)} />
                    {/* Pulse indicator */}
                    <span className={cn("absolute -bottom-0.5 -right-0.5 flex h-3 w-3")}>
                        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-50", isPro ? "bg-violet-400" : "bg-rose-400")} />
                        <span className={cn("relative inline-flex h-3 w-3 rounded-full", isPro ? "bg-violet-500" : "bg-rose-500")} />
                    </span>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">
                        {name}
                        {isMe && <span className="ml-1.5 text-[10px] text-white/30 font-normal">(you)</span>}
                    </p>
                    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold", accent.badge)}>
                        <Shield className="h-2.5 w-2.5" />
                        {isPro ? "PRO" : "CON"}
                    </span>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className={cn("text-lg font-bold tabular-nums", accent.text)}>
                        {messages.reduce((a, m) => a + (m.score ?? 0), 0)}
                    </p>
                    <p className="text-[9px] text-white/30">pts</p>
                </div>
            </div>

            {/* Argument feed */}
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
                        <Sparkles className={cn("h-8 w-8 opacity-20", accent.text)} />
                        <p className="text-xs text-white/20">
                            {isMe ? "Make your opening argument…" : "Waiting for response…"}
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-1">
                        <div className={cn("rounded-2xl border px-3 py-2.5 text-sm leading-relaxed text-white/85", accent.bubble)}>
                            {msg.text}
                        </div>
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[10px] text-white/25">
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {/* Quality indicator */}
                            <div className="flex gap-0.5 items-center ml-auto">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn("h-1 w-1 rounded-full transition-colors",
                                            i < Math.round((msg.score ?? 0) / 2)
                                                ? isPro ? "bg-violet-400" : "bg-rose-400"
                                                : "bg-white/10"
                                        )}
                                    />
                                ))}
                                <span className={cn("ml-1 text-[9px] font-bold", accent.text)}>{msg.score}/10</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className={cn("rounded-2xl border px-3 py-2.5 self-start", accent.bubble)}>
                        <div className="flex gap-1 items-center h-4">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className={cn("h-2 w-2 rounded-full animate-bounce", isPro ? "bg-violet-400" : "bg-rose-400")}
                                    style={{ animationDelay: `${i * 150}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom hint (shows if not visible) */}
            <button
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="mx-3 mb-1 flex items-center justify-center gap-1 rounded-xl py-1 text-[10px] text-white/20 hover:text-white/40 transition-colors"
            >
                <ChevronDown className="h-3 w-3" />
            </button>

            {/* Input area */}
            <div className="border-t border-white/8 p-3 flex flex-col gap-2">
                <div className={cn("relative rounded-xl border transition-all", input.trim() ? `${accent.border} ${accent.bg}` : "border-white/10 bg-white/3")}>
                    <textarea
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKey}
                        rows={3}
                        placeholder={isMe ? "Type your argument… (Enter to send)" : `${name} is responding…`}
                        readOnly={!isMe}
                        className="w-full resize-none bg-transparent px-3 pt-2.5 pb-8 text-sm text-white/90 placeholder-white/20 outline-none leading-relaxed"
                    />
                    {/* Char count */}
                    <span className="absolute bottom-2 left-3 text-[9px] text-white/20">
                        {input.length} chars
                    </span>
                    <button
                        onClick={onSend}
                        disabled={disabled}
                        className={cn(
                            "absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg transition-all shadow-md",
                            !disabled
                                ? `${accent.btn} text-white`
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                        )}
                    >
                        <Send className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
