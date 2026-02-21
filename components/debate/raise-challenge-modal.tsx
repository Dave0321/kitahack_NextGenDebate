"use client";

import { useState, useEffect, useRef } from "react";
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
import {
    Link,
    Sparkles,
    ChevronRight,
    Check,
    Swords,
    Shield,
    Globe,
    Lock,
    Type,
    Youtube,
    Upload,
    FileVideo,
    FileText,
    X,
} from "lucide-react";

interface RaiseChallengeModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<YoutubeChallengeData, "id" | "createdAt" | "status" | "raisedBy">) => void;
    preFillTopic?: string;
}

type Step = 1 | 2 | 3;
type ContentSource = "title" | "youtube" | "file";

export function RaiseChallengeModal({ open, onClose, onSubmit, preFillTopic }: RaiseChallengeModalProps) {
    const [step, setStep] = useState<Step>(1);

    // Source tabs
    const [contentSource, setContentSource] = useState<ContentSource>("title");

    // YouTube path
    const [url, setUrl] = useState("");
    const [validVideoId, setValidVideoId] = useState<string | null>(null);
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
    const [selectedTopic, setSelectedTopic] = useState("");

    // Custom title path
    const [customTopic, setCustomTopic] = useState(preFillTopic ?? "");

    // File upload path
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Common Step 2 / 3
    const [description, setDescription] = useState("");
    const [myRole, setMyRole] = useState<"pro" | "con">("pro");
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [copied, setCopied] = useState(false);

    // Validate YouTube URL
    useEffect(() => {
        const id = extractYouTubeId(url);
        setValidVideoId(id);
        if (id) {
            setSuggestedTopics(suggestTopicsForVideo(url));
        } else {
            setSuggestedTopics([]);
        }
    }, [url]);

    // The final debate topic (varies by source)
    const finalTopic =
        contentSource === "youtube"
            ? selectedTopic || customTopic.trim()
            : customTopic.trim() || (uploadedFile ? uploadedFile.name.replace(/\.[^.]+$/, "") : "");

    const canProceedStep1 =
        contentSource === "youtube"
            ? !!validVideoId && !!finalTopic
            : contentSource === "file"
                ? !!uploadedFile && !!finalTopic
                : !!customTopic.trim();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);
        if (!file) return;
        const allowed = ["video/mp4", "application/pdf"];
        if (!allowed.includes(file.type)) {
            setFileError("Only MP4 video or PDF files are supported.");
            return;
        }
        if (file.size > 500 * 1024 * 1024) { // 500 MB limit
            setFileError("File size must be under 500 MB.");
            return;
        }
        setUploadedFile(file);
        // Auto-populate topic from filename
        if (!customTopic.trim()) {
            setCustomTopic(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
        }
    };

    const handleClose = () => {
        setStep(1);
        setContentSource("title");
        setUrl("");
        setValidVideoId(null);
        setSuggestedTopics([]);
        setSelectedTopic("");
        setCustomTopic(preFillTopic ?? "");
        setUploadedFile(null);
        setFileError(null);
        setDescription("");
        setMyRole("pro");
        setVisibility("public");
        setCopied(false);
        onClose();
    };

    const handleSubmit = () => {
        if (!finalTopic) return;
        onSubmit({
            videoUrl: contentSource === "youtube" ? url : "",
            topic: finalTopic,
            description: description.trim() || `A challenge raised ${contentSource === "youtube" ? "from a YouTube video" : contentSource === "file" ? "from an uploaded file" : "by topic"}. Join and debate: "${finalTopic}"`,
            raisedByRole: myRole,
            visibility,
        });
        handleClose();
    };

    const SOURCES: { id: ContentSource; icon: typeof Type; label: string; desc: string }[] = [
        { id: "title", icon: Type, label: "Custom Title", desc: "Write your own topic" },
        { id: "youtube", icon: Youtube, label: "YouTube Video", desc: "Link a YouTube video" },
        { id: "file", icon: Upload, label: "Upload File", desc: "MP4 or PDF from your device" },
    ];

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
                                        Raise a Challenge
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-white/50 mt-0.5">
                                        Step {step} of 3 — {step === 1 ? "Content & topic" : step === 2 ? "Choose your side" : "Add details & launch"}
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

                        {/* ── Step 1: Content & Topic ── */}
                        {step === 1 && (
                            <div className="flex flex-col gap-5">
                                {/* Source tabs */}
                                <div className="grid grid-cols-3 gap-2">
                                    {SOURCES.map((src) => {
                                        const SrcIcon = src.icon;
                                        return (
                                            <button
                                                key={src.id}
                                                onClick={() => {
                                                    setContentSource(src.id);
                                                    setFileError(null);
                                                }}
                                                className={cn(
                                                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200",
                                                    contentSource === src.id
                                                        ? "bg-violet-500/15 border-violet-500/50 text-violet-300 ring-1 ring-violet-500/30"
                                                        : "bg-white/3 border-white/10 text-white/50 hover:bg-white/8 hover:border-white/20 hover:text-white/80"
                                                )}
                                            >
                                                <SrcIcon className="h-4 w-4" />
                                                <span className="text-[11px] font-bold leading-tight">{src.label}</span>
                                                <span className="text-[9px] opacity-60 leading-tight hidden sm:block">{src.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* ── Tab: Custom Title ── */}
                                {contentSource === "title" && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                                                <Type className="h-3.5 w-3.5 text-violet-400" />
                                                Debate Topic
                                            </Label>
                                            <Input
                                                placeholder="e.g. Should AI replace human teachers?"
                                                value={customTopic}
                                                onChange={(e) => setCustomTopic(e.target.value)}
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                                            />
                                        </div>
                                        <p className="text-xs text-white/40 leading-relaxed">
                                            Write any debate topic you want. Participants will debate directly without a reference video or file.
                                        </p>
                                    </div>
                                )}

                                {/* ── Tab: YouTube ── */}
                                {contentSource === "youtube" && (
                                    <div className="flex flex-col gap-4">
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

                                        {validVideoId && (
                                            <div className="rounded-xl overflow-hidden ring-1 ring-violet-500/30 shadow-lg shadow-violet-500/10">
                                                <YouTubePlayer url={url} title="Challenge Video Preview" />
                                            </div>
                                        )}

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
                                    </div>
                                )}

                                {/* ── Tab: File Upload ── */}
                                {contentSource === "file" && (
                                    <div className="flex flex-col gap-4">
                                        {/* Drop zone */}
                                        <div>
                                            <Label className="text-sm font-medium text-white/80 flex items-center gap-2 mb-2">
                                                <Upload className="h-3.5 w-3.5 text-violet-400" />
                                                Upload File
                                            </Label>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".mp4,video/mp4,.pdf,application/pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />

                                            {uploadedFile ? (
                                                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                                                    {uploadedFile.type === "video/mp4"
                                                        ? <FileVideo className="h-5 w-5 text-emerald-400 shrink-0" />
                                                        : <FileText className="h-5 w-5 text-emerald-400 shrink-0" />
                                                    }
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-white truncate">{uploadedFile.name}</p>
                                                        <p className="text-xs text-white/50">{(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB · {uploadedFile.type === "video/mp4" ? "MP4 Video" : "PDF Document"}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => { setUploadedFile(null); setFileError(null); }}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all shrink-0"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="group w-full rounded-xl border-2 border-dashed border-white/15 bg-white/3 p-6 text-center transition-all hover:border-violet-500/40 hover:bg-violet-500/5"
                                                >
                                                    <Upload className="mx-auto h-8 w-8 text-white/20 group-hover:text-violet-400 transition-colors mb-2" />
                                                    <p className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">
                                                        Click to upload
                                                    </p>
                                                    <p className="text-xs text-white/30 mt-1">
                                                        MP4 video or PDF · Max 500 MB
                                                    </p>
                                                </button>
                                            )}

                                            {fileError && (
                                                <p className="mt-2 text-xs text-rose-400">{fileError}</p>
                                            )}
                                        </div>

                                        {/* Topic for the file */}
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-sm font-medium text-white/80">
                                                Debate Topic
                                            </Label>
                                            <Input
                                                placeholder="e.g. Should university be free?"
                                                value={customTopic}
                                                onChange={(e) => setCustomTopic(e.target.value)}
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50"
                                            />
                                            <p className="text-xs text-white/40">
                                                The topic will be auto-filled from the file name, but you can change it.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!canProceedStep1}
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

                                <div className="flex gap-3 mt-2">
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
                                        Continue
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Add details & launch ── */}
                        {step === 3 && (
                            <div className="flex flex-col gap-5">
                                {/* Topic summary */}
                                <div className="flex items-start gap-3 rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-3">
                                    {myRole === "pro"
                                        ? <Shield className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                                        : <Swords className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                                    }
                                    <div>
                                        <p className="text-xs text-violet-400 mb-0.5">Debate Topic · Playing {myRole.toUpperCase()}</p>
                                        <p className="text-sm font-semibold text-white">{finalTopic}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-sm font-medium text-white/80">
                                        Description{" "}
                                        <span className="text-white/30 font-normal">(optional)</span>
                                    </Label>
                                    <Textarea
                                        placeholder="What's this debate about? Provide any context for challengers..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-violet-500/50 resize-none"
                                    />
                                </div>

                                {/* Visibility */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold text-white/80">Visibility</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setVisibility("public")}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl border px-4 py-3 transition-all",
                                                visibility === "public"
                                                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                                                    : "bg-white/3 border-white/10 text-white/50 hover:bg-white/8 hover:text-white/80"
                                            )}
                                        >
                                            <Globe className={cn("h-4 w-4", visibility === "public" ? "text-emerald-400" : "text-white/30")} />
                                            <div className="text-left">
                                                <p className="text-xs font-bold">Public</p>
                                                <p className="text-[10px] opacity-60">Anyone can challenge</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setVisibility("private")}
                                            className={cn(
                                                "flex items-center gap-2 rounded-xl border px-4 py-3 transition-all",
                                                visibility === "private"
                                                    ? "bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30"
                                                    : "bg-white/3 border-white/10 text-white/50 hover:bg-white/8 hover:text-white/80"
                                            )}
                                        >
                                            <Lock className={cn("h-4 w-4", visibility === "private" ? "text-amber-400" : "text-white/30")} />
                                            <div className="text-left">
                                                <p className="text-xs font-bold">Private</p>
                                                <p className="text-[10px] opacity-60">Invite only via link</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Share Link */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-sky-400" />
                                        Share This Challenge
                                    </p>
                                    <div className="flex gap-2 items-center rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                                        <span className="flex-1 text-xs text-white/40 truncate font-mono select-all">
                                            debateme.app/c/{finalTopic.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30)}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const slug = finalTopic.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30);
                                                navigator.clipboard.writeText(`https://debateme.app/c/${slug}`);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="flex items-center gap-1 text-xs font-semibold rounded-lg px-2.5 py-1.5 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-all shrink-0"
                                        >
                                            {copied ? <Check className="h-3 w-3" /> : <Link className="h-3 w-3" />}
                                            {copied ? "Copied!" : "Copy"}
                                        </button>
                                    </div>
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
                                        disabled={!canProceedStep1}
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
