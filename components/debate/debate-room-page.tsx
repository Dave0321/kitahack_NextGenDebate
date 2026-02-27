"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { YoutubeChallenge } from "@/lib/models/youtube-challenge";
import { YouTubePlayer } from "@/components/debate/youtube-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DebateMessage, ModerationResult, QualityFlag } from "@/lib/models/moderation";
import { DebateModerator } from "@/lib/utils/debate-moderator";
import { toast } from "sonner";
import { generateAIOpponentMessage } from "@/lib/utils/ai-opponent";
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
    RefreshCw,
    AlertCircle,
    Play,
    CheckCircle,
} from "lucide-react";
import {
    generateDebateTopicContent,
    judgeDebate,
    type DebateTranscriptEntry,
} from "@/lib/utils/debate-judge";
import type { TopicContent, DebateJudgement } from "@/lib/models/debate-result";
import { PostDebateSummaryModal } from "@/components/debate/post-debate-summary-modal";

// ---------------------------------------------------------------------------
// Props & Types
// ---------------------------------------------------------------------------

interface DebateRoomPageProps {
    challenge: YoutubeChallenge;
    currentUser: string;
    onExit: () => void;
    userRole?: "pro" | "con";
    opponentCharacter?: "logician" | "activist";
}

interface Message {
    id: string;
    player: "pro" | "con";
    name: string;
    text: string;
    timestamp: Date;
    score?: number;
    flags?: QualityFlag[];
}

type GamePhase = "prep" | "countdown" | "debate" | "ended";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ROUND_SECONDS = 30;
const MAX_ROUNDS = 1;

function scoreArgument(text: string): number {
    const words = text.trim().split(/\s+/).length;
    const hasClaims = /because|therefore|however|evidence|studies|research|data|fact/i.test(text);
    const hasCounter = /but|although|despite|while|whereas|on the other hand/i.test(text);
    let score = Math.min(10, Math.max(1, Math.floor(words / 8)));
    if (hasClaims) score = Math.min(10, score + 2);
    if (hasCounter) score = Math.min(10, score + 1);
    return score;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DebateRoomPage({
    challenge,
    currentUser,
    onExit,
    userRole,
    opponentCharacter = "logician",
}: DebateRoomPageProps) {
    const isPlayerOne = challenge.raisedBy === currentUser;
    const myName = currentUser;
    const opponentName = isPlayerOne ? (challenge.acceptedBy ?? "Challenger") : challenge.raisedBy;
    const myRole: "pro" | "con" = userRole ?? (isPlayerOne ? "pro" : "con");
    const oppRole: "pro" | "con" = myRole === "pro" ? "con" : "pro";

    // Determine mode: player vs AI or player vs player.
    // - AI Training sessions use ids like "ai-..."
    // - Explore Topics → "Debate AI" uses synthetic ids like "card-..."
    // - Live & Upcoming matches use "ch-..." and are player vs player.
    const isAIDebate =
        challenge.id.startsWith("ai-") ||
        challenge.id.startsWith("card-") ||
        challenge.acceptedBy === "AI Debater";

    // ── Game State & Phases ─────────────────────────────────────────────────
    // AI debates start in a preparation phase; player-vs-player starts directly in debate.
    const [gamePhase, setGamePhase] = useState<GamePhase>(isAIDebate ? "prep" : "debate");
    const [myReady, setMyReady] = useState(false);
    const [oppReady, setOppReady] = useState(false);
    const [countdown, setCountdown] = useState(3);

    // ── Topic-specific AI content ───────────────────────────────────────────
    const [topicContent, setTopicContent] = useState<TopicContent | null>(null);

    useEffect(() => {
        generateDebateTopicContent(challenge.topic).then(setTopicContent);
    }, [challenge.topic]);

    const currentTips = topicContent?.tips ?? [];
    const currentJudgeComments = topicContent?.judgeComments ?? {
        neutral: ["Analysing the debate…"],
        proLead: ["PRO is pulling ahead."],
        conLead: ["CON is pulling ahead."],
    };

    // ── Audio Context for Beeps ─────────────────────────────────────────────
    const playBeep = useCallback((freq: number, type: OscillatorType = 'sine', duration = 0.5, vol = 0.1) => {
        if (typeof window === 'undefined') return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(vol, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio context not supported", e);
        }
    }, []);

    // ── Timer ───────────────────────────────────────────────────────────────
    const [seconds, setSeconds] = useState(ROUND_SECONDS);
    const [timerRunning, setTimerRunning] = useState(false);
    const [round, setRound] = useState(1);

    useEffect(() => {
        if (!timerRunning || gamePhase !== "debate") return;
        if (seconds <= 0) { setTimerRunning(false); return; }
        const id = setInterval(() => setSeconds((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [timerRunning, seconds, gamePhase]);

    const formatTime = (s: number) =>
        `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    const timerColor = seconds > 120 ? "text-emerald-300" : seconds > 60 ? "text-amber-300" : "text-rose-400";
    const timerBg = seconds > 120
        ? "bg-emerald-500/10 border-emerald-500/20"
        : seconds > 60
            ? "bg-amber-500/10 border-amber-500/20"
            : "bg-rose-500/10 border-rose-500/20 animate-pulse";

    // ── Pre-Game & Countdown Logic (AI-only) ────────────────────────────────

    // In player-vs-player mode we skip the prep/countdown ceremony
    // and immediately allow both sides to debate with a running timer.
    useEffect(() => {
        if (!isAIDebate) {
            setGamePhase("debate");
            setTimerRunning(true);
        }
    }, [isAIDebate]);

    // Simulate AI opponent getting ready (AI mode only)
    useEffect(() => {
        if (!isAIDebate) return;
        if (gamePhase === "prep") {
            const timer = setTimeout(() => {
                setOppReady(true);
            }, 3000 + Math.random() * 4000); // 3-7 seconds delay
            return () => clearTimeout(timer);
        }
    }, [gamePhase, isAIDebate]);

    // Transition to countdown when both are ready (AI mode only)
    useEffect(() => {
        if (!isAIDebate) return;
        if (gamePhase === "prep" && myReady && oppReady) {
            setGamePhase("countdown");
            setCountdown(3);
        }
    }, [gamePhase, myReady, oppReady, isAIDebate]);

    // Handle countdown animation and sounds (AI mode only)
    useEffect(() => {
        if (!isAIDebate) return;
        if (gamePhase === "countdown") {
            if (countdown > 0) {
                playBeep(440, 'square', 0.2, 0.05); // Short tick
                const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
                return () => clearTimeout(timer);
            } else if (countdown === 0) {
                playBeep(880, 'square', 0.6, 0.1); // Higher START sound
                const timer = setTimeout(() => {
                    setGamePhase("debate");
                    setTimerRunning(true);
                }, 1000); // Show "DEBATE!" for 1s
                return () => clearTimeout(timer);
            }
        }
    }, [gamePhase, countdown, playBeep, isAIDebate]);

    // ── Messages ─────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<Message[]>([]);

    // Sync messages across tabs to mock real-time chat without database
    useEffect(() => {
        if (isAIDebate) return;
        const handleStorage = (e: StorageEvent) => {
            if (e.key === `debate-messages-${challenge.id}` && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    setMessages(parsed.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));
                } catch (err) { }
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [challenge.id, isAIDebate]);

    // Load initial messages for demo
    useEffect(() => {
        if (!isAIDebate && typeof window !== "undefined") {
            const saved = localStorage.getItem(`debate-messages-${challenge.id}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setMessages(parsed.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) })));
                } catch (err) { }
            }
        }
    }, [challenge.id, isAIDebate]);
    const [myInput, setMyInput] = useState("");
    const [oppInput, setOppInput] = useState("");
    const [myTyping, setMyTyping] = useState(false);
    const [oppTyping, setOppTyping] = useState(false);
    const [activeTip, setActiveTip] = useState<string | null>(null);

    // ── Moderation ──────────────────────────────────────────────────────────
    const [pendingMessage, setPendingMessage] = useState("");
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [isBlockedOpen, setIsBlockedOpen] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    const [userScore, setUserScore] = useState(100);
    const [isRegenerateVisible, setIsRegenerateVisible] = useState(false);
    const [currentModerationResult, setCurrentModerationResult] = useState<ModerationResult | null>(null);
    const [blockedResult, setBlockedResult] = useState<ModerationResult | null>(null);

    // ── Post-debate summary / judging ───────────────────────────────────────
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [isJudging, setIsJudging] = useState(false);
    const [judgement, setJudgement] = useState<DebateJudgement | null>(null);
    const [judgeError, setJudgeError] = useState<string | null>(null);

    const myMessagesEndRef = useRef<HTMLDivElement>(null);
    const oppMessagesEndRef = useRef<HTMLDivElement>(null);
    const oppTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const myMessages = messages.filter((m) => m.player === myRole);
    const oppMessages = messages.filter((m) => m.player === oppRole);

    const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) =>
        ref.current?.scrollIntoView({ behavior: "smooth" });

    const sendMessage = useCallback(
        (player: "pro" | "con", name: string, text: string, flags?: QualityFlag[]) => {
            if (!text.trim()) return;
            const score = scoreArgument(text);
            const msg: Message = {
                id: `${Date.now()}-${player}`,
                player,
                name,
                text: text.trim(),
                timestamp: new Date(),
                score,
                flags,
            };
            setMessages((prev) => {
                const newMsgs = [...prev, msg];
                if (!isAIDebate && typeof window !== "undefined") {
                    localStorage.setItem(`debate-messages-${challenge.id}`, JSON.stringify(newMsgs));
                }
                return newMsgs;
            });
            return msg;
        },
        [isAIDebate, challenge.id],
    );

    function handleGameOver() {
        console.log("Game over — user reached score 0 due to rule violations");
        toast.error("Debate forfeited due to rule violations.");
        endDebate("forfeit");
    }

    const endDebate = useCallback(
        async (_reason: "completed" | "forfeit") => {
            setGamePhase("ended");
            setTimerRunning(false);
            setIsSummaryOpen(true);
            setIsJudging(true);
            setJudgement(null);
            setJudgeError(null);

            try {
                const transcript: DebateTranscriptEntry[] = messages.map((m) => ({
                    debaterId: m.player === myRole ? "A" : "B",
                    text: m.text,
                }));

                const result = await judgeDebate({
                    topic: challenge.topic,
                    debaterAName: myName,
                    debaterBName: opponentName,
                    debaterARole: myRole,
                    debaterBRole: oppRole,
                    transcript,
                });

                setJudgement(result);
            } catch (err) {
                console.error("endDebate judging error:", err);
                setJudgeError("The AI judge encountered an error. Please try again.");
            } finally {
                setIsJudging(false);
            }
        },
        [messages, myRole, oppRole, myName, opponentName, challenge.topic],
    );

    function executeSend(content: string, penalty: number, flags?: QualityFlag[]) {
        if (userScore + penalty <= 0) {
            handleGameOver();
            return;
        }

        setUserScore((prev) => prev + penalty);
        sendMessage(myRole, myName, content, flags);
        setMyInput("");

        // In pure player-vs-player mode we stop here — the other player will
        // see the message on their own screen and can reply with their turn.
        if (!isAIDebate) {
            if (currentTips.length > 0) {
                const tip = currentTips[Math.floor(Math.random() * currentTips.length)];
                setActiveTip(tip);
                setTimeout(() => setActiveTip(null), 5000);
            }
            return;
        }

        // Player vs AI: generate AI reply on the opposing side.
        setOppTyping(true);
        if (oppTimerRef.current) clearTimeout(oppTimerRef.current);

        oppTimerRef.current = setTimeout(async () => {
            let selectedReply = await generateAIOpponentMessage({
                topic: challenge.topic,
                sdg: "Target SDG",
                aiStance: oppRole,
                transcript: messages.map((m) => ({
                    debaterId: (m.player === myRole ? "user" : "ai") as "user" | "ai",
                    text: m.text,
                })).concat([{ debaterId: "user", text: content }]),
            });

            const mappedHistory: DebateMessage[] = [
                ...messages.map((m) => ({
                    role: (m.player === myRole ? "user" : "assistant") as DebateMessage["role"],
                    content: m.text,
                    flags: m.flags,
                })),
                { role: "user" as const, content },
            ];

            let moderationResult = await DebateModerator.checkRules(selectedReply, mappedHistory, {
                title: challenge.topic,
                description: challenge.topic,
                selectedSDG: "",
                userStance: userRole ?? "pro",
            });

            if (moderationResult.verdict === "block") {
                selectedReply = await generateAIOpponentMessage({
                    topic: challenge.topic,
                    sdg: "",
                    aiStance: oppRole,
                    transcript: mappedHistory.map(m => ({
                        debaterId: (m.role === "user" ? "user" : "ai") as "user" | "ai",
                        text: m.content
                    }))
                });

                moderationResult = await DebateModerator.checkRules(selectedReply, mappedHistory, {
                    title: challenge.topic,
                    description: challenge.topic,
                    selectedSDG: "",
                    userStance: userRole ?? "pro",
                });

                if (moderationResult.verdict === "block") {
                    setIsRegenerateVisible(true);
                    setOppTyping(false);
                    return;
                }
            }

            sendMessage(oppRole, opponentName, selectedReply, moderationResult.qualityFlags);
            setOppTyping(false);
        }, 1500 + Math.random() * 2000);

        if (currentTips.length > 0) {
            const tip = currentTips[Math.floor(Math.random() * currentTips.length)];
            setActiveTip(tip);
            setTimeout(() => setActiveTip(null), 5000);
        }
    }

    const handleMySend = async () => {
        if (!myInput.trim()) return;

        setIsModerating(true);
        setPendingMessage(myInput);

        const mappedHistory: DebateMessage[] = messages.map((m) => ({
            role: m.player === myRole ? "user" : "assistant",
            content: m.text,
            flags: m.flags,
        }));

        const result = await DebateModerator.checkRules(myInput, mappedHistory, {
            title: challenge.topic,
            description: challenge.topic,
            selectedSDG: "",
            userStance: userRole ?? "pro",
        });

        setCurrentModerationResult(result);

        if (result.verdict === "block") {
            setBlockedResult(result);
            setIsBlockedOpen(true);
            setIsModerating(false);
            return;
        }

        if (result.verdict === "warn") {
            setIsWarningOpen(true);
            setIsModerating(false);
            return;
        }

        executeSend(myInput, result.scoreImpact, result.qualityFlags);
        setIsModerating(false);
    };

    useEffect(() => { scrollToBottom(myMessagesEndRef); }, [myMessages]);
    useEffect(() => { scrollToBottom(oppMessagesEndRef); }, [oppMessages]);

    const proScore = messages.filter((m) => m.player === "pro").reduce((a, m) => a + (m.score ?? 0), 0);
    const conScore = messages.filter((m) => m.player === "con").reduce((a, m) => a + (m.score ?? 0), 0);
    const totalScore = proScore + conScore || 1;

    const nextRound = () => {
        setRound((r) => r + 1);
        setSeconds(ROUND_SECONDS);
        setTimerRunning(true);
    };

    return (
        <div className="h-screen relative bg-gradient-to-b from-[#07070e] via-[#0c0c1a] to-[#0f0f22] flex flex-col overflow-hidden">

            {/* ── Countdown Overlay ────────────────────────────────────────────── */}
            {gamePhase === "countdown" && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div key={countdown} className="animate-in zoom-in-50 fade-in duration-500 ease-out flex flex-col items-center">
                        {/* Added pr-8 below to prevent italic text clipping */}
                        <h2 className="text-[180px] md:text-[250px] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30 drop-shadow-[0_0_60px_rgba(255,255,255,0.4)] leading-none pr-8">
                            {countdown > 0 ? countdown : "DEBATE!"}
                        </h2>
                    </div>
                </div>
            )}

            {/* ── Top bar ──────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/8 bg-[#09091a]/90 backdrop-blur-xl px-4 lg:px-6">
                <button
                    onClick={onExit}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex-shrink-0"
                    aria-label="Exit"
                >
                    <ArrowLeft className="h-4 w-4 text-white/70" />
                </button>

                <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-400/70">
                        Debate Room · Round {round}
                    </p>
                    <h1 className="text-sm font-semibold text-white/90 truncate leading-tight">
                        {challenge.topic}
                    </h1>
                </div>

                <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-300 text-xs">
                    Score: {userScore}
                </Badge>

                <div className="hidden md:flex items-center gap-2">
                    <span className="text-[10px] font-bold text-violet-400">PRO {proScore}</span>
                    <div className="w-24 h-1.5 rounded-full overflow-hidden bg-white/10 flex">
                        <div className="bg-violet-500 transition-all duration-700" style={{ width: `${(proScore / totalScore) * 100}%` }} />
                        <div className="bg-rose-500 transition-all duration-700" style={{ width: `${(conScore / totalScore) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-rose-400">CON {conScore}</span>
                </div>

                <div
                    className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 transition-all cursor-pointer", timerBg, gamePhase !== "debate" && "opacity-50 cursor-not-allowed")}
                    onClick={() => { if (gamePhase === "debate") setTimerRunning((v) => !v); }}
                >
                    <Timer className={cn("h-3.5 w-3.5", timerColor)} />
                    <span className={cn("text-sm font-mono font-bold", timerColor)}>{formatTime(seconds)}</span>
                </div>

                {seconds === 0 && round < MAX_ROUNDS && gamePhase === "debate" && (
                    <button
                        onClick={nextRound}
                        className="flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                    >
                        <Zap className="h-3.5 w-3.5" />
                        Next Round
                    </button>
                )}
                {seconds === 0 && round >= MAX_ROUNDS && gamePhase === "debate" && (
                    <button
                        onClick={() => endDebate("completed")}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                    >
                        <Crown className="h-3.5 w-3.5" />
                        End Debate
                    </button>
                )}
            </header>

            {/* ── AI tip toast ─────────────────────────────────────────────── */}
            <div
                className={cn(
                    "fixed top-16 left-1/2 z-50 -translate-x-1/2 transition-all duration-300",
                    activeTip ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
                )}
            >
                <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-[#13132a]/95 backdrop-blur px-4 py-2 shadow-xl shadow-violet-500/20">
                    <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                    <p className="text-xs text-white/80">{activeTip}</p>
                </div>
            </div>

            {/* ── Main 3-column arena ──────────────────────────────────────── */}
            <main className="flex flex-1 gap-0 overflow-hidden relative">

                {/* LEFT: PRO player */}
                <PlayerColumn
                    name={myName}
                    role="pro"
                    isMe
                    messages={myMessages}
                    input={myInput}
                    onInputChange={setMyInput}
                    onSend={handleMySend}
                    messagesEndRef={myMessagesEndRef}
                    disabled={gamePhase !== "debate" || myInput.trim().length === 0 || isModerating || isWarningOpen || isBlockedOpen}
                    isTyping={myTyping}
                    isModerating={isModerating}
                    isRegenerateVisible={isRegenerateVisible}
                    onRegenerate={() => {
                        setIsRegenerateVisible(false);
                        executeSend(pendingMessage, 0, currentModerationResult?.qualityFlags);
                    }}
                    phase={gamePhase}
                    isReady={myReady}
                    onReadyToggle={() => setMyReady(r => !r)}
                />

                {/* CENTER: Resource + scoreboard */}
                <div className="hidden lg:flex flex-col w-[36%] min-w-0 border-x border-white/8 bg-[#0a0a18] overflow-y-auto">
                    <div className="flex items-center justify-center gap-3 py-3 border-b border-white/8">
                        <span className="text-xs font-bold text-violet-400 tracking-widest">PRO</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/40">
                            <Swords className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-rose-400 tracking-widest">CON</span>
                    </div>

                    <div className="p-3 border-b border-white/8">
                        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Reference Source</p>
                        <div className="rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60 relative z-30">
                            <YouTubePlayer url={challenge.videoUrl} title={challenge.topic} />
                        </div>
                    </div>

                    <div className="p-3 border-b border-white/8">
                        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">Topic</p>
                        <p className="text-sm font-semibold text-white/90 leading-snug">{challenge.topic}</p>
                    </div>

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

                    <JudgePanel
                        proScore={proScore}
                        conScore={conScore}
                        totalMessages={messages.length}
                        judgeComments={currentJudgeComments}
                    />

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

                    <div className="p-3">
                        <Button
                            onClick={() => endDebate("forfeit")}
                            variant="outline"
                            className="w-full bg-transparent border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/50 transition-all text-xs"
                        >
                            <Flag className="h-3.5 w-3.5 mr-2" />
                            Forfeit Debate
                        </Button>
                    </div>
                </div>

                {/* RIGHT: CON player */}
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
                    disabled={gamePhase !== "debate" || oppInput.trim().length === 0}
                    allowTyping={!isAIDebate}
                    isTyping={oppTyping}
                    phase={gamePhase}
                    isReady={oppReady}
                />
            </main>

            {/* ── Mobile bottom bar ────────────────────────────────────────── */}
            <div className="lg:hidden border-t border-white/8 bg-[#0a0a18] px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-violet-400">PRO {proScore}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/10 flex">
                        <div className="bg-violet-500" style={{ width: `${(proScore / totalScore) * 100}%` }} />
                        <div className="bg-rose-500" style={{ width: `${(conScore / totalScore) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-rose-400">CON {conScore}</span>
                </div>
                <Button
                    onClick={() => endDebate("forfeit")}
                    variant="outline"
                    size="sm"
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs"
                >
                    <Flag className="h-3.5 w-3.5 mr-1" /> Forfeit
                </Button>
            </div>

            {/* ── Block Dialog ─────────────────────────────────────────────── */}
            <Dialog
                open={isBlockedOpen}
                onOpenChange={(open) => {
                    if (!open) { setIsBlockedOpen(false); setBlockedResult(null); setMyInput(""); }
                }}
            >
                {/* Dialog content as before */}
                <DialogContent className="bg-[#0a0a18] border border-rose-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-400">
                            <AlertCircle className="h-5 w-5 text-rose-400" />
                            🚫 Message Blocked
                        </DialogTitle>
                        <DialogDescription className="text-white/70">
                            {blockedResult?.violationType || "Your message has been blocked by the moderator."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3">
                            <p className="text-sm text-rose-100">
                                {blockedResult?.feedback || "This message cannot be sent because it violates debate rules."}
                            </p>
                        </div>
                        {blockedResult?.suggestedCorrection && (
                            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-white/50 mb-1">Suggestion:</p>
                                <p className="text-sm text-white/80">{blockedResult.suggestedCorrection}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => { setIsBlockedOpen(false); setBlockedResult(null); setMyInput(""); }}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white"
                        >
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Warning Dialog ───────────────────────────────────────────── */}
            <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
                <DialogContent className="bg-[#0a0a18] border border-amber-500/20">
                    {/* Dialog content as before */}
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-400">
                            <AlertCircle className="h-5 w-5" />
                            Argument Warning
                        </DialogTitle>
                        <DialogDescription className="text-white/70">
                            {currentModerationResult?.violationType || "Your message has been flagged"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                            <p className="text-sm text-amber-200">
                                {currentModerationResult?.feedback || "Please review your message"}
                            </p>
                        </div>
                        {currentModerationResult?.suggestedCorrection && (
                            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-white/50 mb-1">Suggestion:</p>
                                <p className="text-sm text-white/80">{currentModerationResult.suggestedCorrection}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setIsWarningOpen(false)}
                            className="bg-transparent border-white/20 hover:bg-white/10 text-white"
                        >
                            Edit Message
                        </Button>
                        <Button
                            onClick={() => {
                                setIsWarningOpen(false);
                                executeSend(
                                    pendingMessage,
                                    currentModerationResult?.scoreImpact || 0,
                                    currentModerationResult?.qualityFlags,
                                );
                            }}
                            className="bg-amber-600 hover:bg-amber-500 text-white"
                        >
                            Proceed Anyway
                            {currentModerationResult?.scoreImpact && currentModerationResult.scoreImpact !== 0 && (
                                <span className="ml-2 text-xs">{currentModerationResult.scoreImpact} pts</span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Post-debate Summary Modal (with AI judging) ───────────────── */}
            <PostDebateSummaryModal
                open={isSummaryOpen}
                isLoading={isJudging}
                judgement={judgement}
                error={judgeError}
                onExit={onExit}
                onRetry={async () => {
                    setJudgeError(null);
                    setIsJudging(true);
                    try {
                        const transcript: DebateTranscriptEntry[] = messages.map((m) => ({
                            debaterId: m.player === myRole ? "A" : "B",
                            text: m.text,
                        }));
                        const result = await judgeDebate({
                            topic: challenge.topic,
                            debaterAName: myName,
                            debaterBName: opponentName,
                            debaterARole: myRole,
                            debaterBRole: oppRole,
                            transcript,
                        });
                        setJudgement(result);
                    } catch {
                        setJudgeError("Judging failed again. Please exit and try a new debate.");
                    } finally {
                        setIsJudging(false);
                    }
                }}
            />
        </div>
    );
}

// ── Judge Panel ─────────────────────────────────────────────────────────────

interface JudgePanelProps {
    proScore: number;
    conScore: number;
    totalMessages: number;
    judgeComments: {
        neutral: string[];
        proLead: string[];
        conLead: string[];
    };
}

function JudgePanel({ proScore, conScore, totalMessages, judgeComments }: JudgePanelProps) {
    const [commentIdx, setCommentIdx] = useState(0);
    const [gavel, setGavel] = useState(false);

    const diff = proScore - conScore;
    const pool =
        totalMessages === 0
            ? judgeComments.neutral
            : diff > 2
                ? judgeComments.proLead
                : diff < -2
                    ? judgeComments.conLead
                    : judgeComments.neutral;

    useEffect(() => {
        const id = setInterval(() => {
            setGavel(true);
            setTimeout(() => setGavel(false), 600);
            setCommentIdx((i) => (i + 1) % Math.max(pool.length, 1));
        }, 6000);
        return () => clearInterval(id);
    }, [pool.length]);

    const comment = pool[commentIdx % Math.max(pool.length, 1)] ?? "Analysing the debate…";

    return (
        <div className="mx-3 mb-3 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-amber-900/5 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/15">
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
                    <Scale className={cn("h-4 w-4 text-amber-400 transition-transform duration-300", gavel && "scale-110 rotate-6")} />
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

            <div className="px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-white/65 italic min-h-[3rem]">
                    &ldquo;{comment}&rdquo;
                </p>
            </div>

            <div className="flex items-center gap-0 border-t border-amber-500/10">
                <div className={cn("flex-1 flex flex-col items-center py-2 transition-all", diff > 0 ? "bg-violet-500/10" : "bg-transparent")}>
                    <p className="text-base font-bold tabular-nums text-violet-400">{proScore}</p>
                    <p className="text-[9px] text-white/30">{diff > 0 ? "⬆ " : ""}PRO</p>
                </div>
                <div className="flex flex-col items-center justify-center w-8">
                    <Scale className="h-3.5 w-3.5 text-amber-400/50" />
                </div>
                <div className={cn("flex-1 flex flex-col items-center py-2 transition-all", diff < 0 ? "bg-rose-500/10" : "bg-transparent")}>
                    <p className="text-base font-bold tabular-nums text-rose-400">{conScore}</p>
                    <p className="text-[9px] text-white/30">CON{diff < 0 ? " ⬆" : ""}</p>
                </div>
            </div>
        </div>
    );
}

// ── Player column ──────────────────────────────────────────────────────────

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
    isModerating?: boolean;
    isRegenerateVisible?: boolean;
    onRegenerate?: () => void;
    phase?: GamePhase;
    isReady?: boolean;
    onReadyToggle?: () => void;
    allowTyping?: boolean;
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
    isModerating = false,
    isRegenerateVisible = false,
    onRegenerate,
    phase,
    isReady,
    onReadyToggle,
    allowTyping = false,
}: PlayerColumnProps) {
    const isPro = role === "pro";
    const accent = isPro
        ? {
            bg: "bg-violet-500/10",
            border: "border-violet-500/25",
            text: "text-violet-300",
            ring: "ring-violet-500/40",
            badge: "bg-violet-500/20 text-violet-300",
            bubble: "bg-violet-500/15 border-violet-500/20",
            btn: "bg-violet-600 hover:bg-violet-500 shadow-violet-500/30",
        }
        : {
            bg: "bg-rose-500/10",
            border: "border-rose-500/25",
            text: "text-rose-300",
            ring: "ring-rose-500/40",
            badge: "bg-rose-500/20 text-rose-300",
            bubble: "bg-rose-500/15 border-rose-500/20",
            btn: "bg-rose-600 hover:bg-rose-500 shadow-rose-500/30",
        };

    const canType = isMe || allowTyping;

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && canType && !isModerating) onSend();
        }
    };

    return (
        <div className="flex flex-1 flex-col border-r border-white/8 last:border-r-0 min-w-0 h-full overflow-hidden">

            {/* Player header */}
            <div className={cn("flex items-center gap-3 px-4 py-3 border-b border-white/8 z-30", accent.bg)}>
                <div className={cn("relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ring-1", accent.ring, isPro ? "bg-violet-500/20" : "bg-rose-500/20")}>
                    <Crown className={cn("h-5 w-5", accent.text)} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
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

            <div className="relative flex-1 flex flex-col overflow-hidden">
                {/* Argument feed */}
                <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
                    {messages.length === 0 && phase !== "prep" && phase !== "countdown" && (
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
                                <div className="flex gap-0.5 items-center ml-auto">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-1 w-1 rounded-full transition-colors",
                                                i < Math.round((msg.score ?? 0) / 2)
                                                    ? isPro ? "bg-violet-400" : "bg-rose-400"
                                                    : "bg-white/10",
                                            )}
                                        />
                                    ))}
                                    <span className={cn("ml-1 text-[9px] font-bold", accent.text)}>{msg.score}/10</span>
                                </div>
                            </div>
                        </div>
                    ))}

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

                    {isRegenerateVisible && (
                        <div className="flex items-center justify-center py-2">
                            <Button
                                onClick={onRegenerate}
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Regenerate Response
                            </Button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <button
                    onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="mx-3 mb-1 flex items-center justify-center gap-1 rounded-xl py-1 text-[10px] text-white/20 hover:text-white/40 transition-colors"
                >
                    <ChevronDown className="h-3 w-3" />
                </button>

                {/* Input area */}
                <div className="border-t border-white/8 p-3 flex flex-col gap-2 z-10">
                    <div className={cn(
                        "relative rounded-xl border transition-all",
                        input.trim() ? `${accent.border} ${accent.bg}` : "border-white/10 bg-white/3",
                    )}>
                        <textarea
                            value={input}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyDown={handleKey}
                            rows={3}
                            placeholder={canType ? "Type your argument… (Enter to send)" : `${name} is responding…`}
                            readOnly={!canType || isModerating || phase !== "debate"}
                            disabled={!canType || isModerating || phase !== "debate"}
                            className="w-full resize-none bg-transparent px-3 pt-2.5 pb-8 text-sm text-white/90 placeholder-white/20 outline-none leading-relaxed disabled:opacity-50"
                        />
                        <span className="absolute bottom-2 left-3 text-[9px] text-white/20">
                            {input.length} chars
                        </span>
                        <button
                            onClick={onSend}
                            disabled={disabled || isModerating}
                            className={cn(
                                "absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg transition-all shadow-md",
                                !disabled && !isModerating
                                    ? `${accent.btn} text-white`
                                    : "bg-white/5 text-white/20 cursor-not-allowed",
                            )}
                        >
                            {isModerating ? (
                                <Spinner className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Preparation Phase Overlay ─────────────────────────────────────── */}
                {phase === "prep" && (
                    <div className="absolute inset-0 z-20 bg-[#0a0a18]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border-t border-white/5">
                        {isMe ? (
                            <>
                                <Play className={cn("h-12 w-12 mb-4 opacity-80", accent.text)} />
                                <h3 className="text-xl font-bold text-white mb-2">Preparation Phase</h3>
                                <p className="text-sm text-white/70 mb-6 max-w-[250px]">
                                    Watch the video context and prepare your opening arguments.
                                </p>
                                <Button
                                    onClick={onReadyToggle}
                                    className={cn(
                                        "w-full max-w-[200px] transition-all shadow-lg",
                                        isReady ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20" : accent.btn
                                    )}
                                >
                                    {isReady ? (
                                        <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Ready</span>
                                    ) : (
                                        "I'm Ready"
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    {isReady ? (
                                        <CheckCircle className="h-12 w-12 mb-4 text-emerald-400" />
                                    ) : (
                                        <Spinner className={cn("h-12 w-12 mb-4", accent.text)} />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                                <p className="text-sm text-white/70 mb-6">
                                    {isReady ? "Opponent is ready." : "Reviewing the material..."}
                                </p>
                                <Badge variant="outline" className={cn(
                                    "px-4 py-1.5 text-xs",
                                    isReady ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                )}>
                                    {isReady ? "Ready" : "Preparing..."}
                                </Badge>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}