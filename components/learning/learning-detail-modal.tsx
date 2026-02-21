"use client";

import { useState } from "react";
import type { LearningCard } from "@/lib/models/learning-card";
import { getSDGById } from "@/lib/data/sdg-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Brain,
  GraduationCap,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningDetailModalProps {
  card: LearningCard | null;
  open: boolean;
  onClose: () => void;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "logical-fallacy":
      return Brain;
    case "sdg":
      return Globe;
    case "general-lesson":
      return GraduationCap;
    default:
      return BookOpen;
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "logical-fallacy":
      return "Logical Fallacy";
    case "sdg":
      return "SDG Learning";
    case "general-lesson":
      return "General Lesson";
    default:
      return "Learning";
  }
}

// Estimated reading time in minutes based on word count
function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Fallacy quiz data keyed by card id
const FALLACY_QUIZZES: Record<string, { scenario: string; options: [string, string]; answerIdx: 0 | 1; explanation: string }> = {
  "lf-1": {
    scenario: "During a debate on climate policy, Alice says: 'We can't trust Bob's climate data — he once cheated on a school test.' Is this an Ad Hominem?",
    options: ["Yes — it attacks Bob's character, not his data.", "No — Bob's past behavior is relevant evidence."],
    answerIdx: 0,
    explanation: "Correct! Alice is attacking Bob personally rather than addressing the validity of the data itself.",
  },
  "lf-2": {
    scenario: "Carol says 'We need stricter gun laws.' Dave responds: 'So you want to ban all guns and leave citizens defenceless?' Is this a Straw Man?",
    options: ["Yes — Dave exaggerated Carol's position.", "No — Dave is making a legitimate concern."],
    answerIdx: 0,
    explanation: "Correct! Dave created a distorted version of Carol's argument to make it easier to attack.",
  },
  "lf-3": {
    scenario: "Emma claims a supplement is safe because a famous athlete endorses it. Is this Appeal to Authority?",
    options: ["Yes — the athlete is not a medical expert.", "No — athletes are experts in health."],
    answerIdx: 0,
    explanation: "Right! The celebrity's fame does not make them a credible authority on supplement safety.",
  },
  "lf-4": {
    scenario: "A politician says: 'Either you support this bill, or you're against the people.' Is this a False Dilemma?",
    options: ["Yes — there are many positions beyond support or opposition.", "No — political bills require clear sides."],
    answerIdx: 0,
    explanation: "Correct! One could partially agree, propose amendments, or have nuanced views.",
  },
  "lf-5": {
    scenario: "'If we allow same-sex couples to marry, next people will want to marry animals.' Is this Slippery Slope?",
    options: ["Yes — no logical chain justifies that conclusion.", "No — it's a reasonable extrapolation."],
    answerIdx: 0,
    explanation: "Correct! The argument assumes an extreme outcome with no logical or evidential basis.",
  },
  "lf-6": {
    scenario: "Asked about rising crime, a councillor starts talking about the city's new park. Is this a Red Herring?",
    options: ["Yes — the park is irrelevant to the crime question.", "No — parks reduce crime so it is relevant."],
    answerIdx: 0,
    explanation: "This one is tricky. If parks genuinely reduce crime, it could be relevant — but as presented, the councillor is changing the subject without supporting that link, making it a Red Herring.",
  },
};

// General lesson key takeaways keyed by card id
const LESSON_TAKEAWAYS: Record<string, string[]> = {
  "gl-1": [
    "Check the author's credentials and institutional affiliation.",
    "Cross-reference at least 3 independent sources.",
    "Prefer peer-reviewed or primary sources over opinion pieces.",
    "Note the publication date — outdated information can mislead.",
  ],
  "gl-2": [
    "Check the site's 'About' page and publication history.",
    "Reverse image-search suspicious photos.",
    "Use fact-checking platforms (Snopes, FactCheck.org, AFP Fact Check).",
    "Look for emotional or sensational language as a red flag.",
  ],
  "gl-3": [
    "Identify the author's potential conflicts of interest.",
    "Ask: What evidence is missing or downplayed?",
    "Look for weasel words like 'some say' or 'many believe'.",
    "Compare coverage across ideologically different outlets.",
  ],
  "gl-4": [
    "Every argument needs a clear thesis, evidence, and warrant.",
    "Acknowledge and rebut counterarguments proactively.",
    "Use the Toulmin model: Claim → Grounds → Warrant → Rebuttal.",
    "Qualify your claims to avoid overstatement.",
  ],
};

export function LearningDetailModal({
  card,
  open,
  onClose,
}: LearningDetailModalProps) {
  const [showExample, setShowExample] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  if (!card) return null;

  const Icon = getCategoryIcon(card.category);
  const sdg = card.sdgId ? getSDGById(card.sdgId) : null;
  const readTime = estimateReadTime(card.content);
  const quiz = FALLACY_QUIZZES[card.id];
  const takeaways = LESSON_TAKEAWAYS[card.id];

  const handleClose = () => {
    setShowExample(false);
    setQuizAnswer(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[88vh] overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f0f1a] to-[#16162a] shadow-2xl">
          {/* Top accent */}
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{
              background: sdg
                ? `linear-gradient(to right, transparent, ${sdg.color}, transparent)`
                : "linear-gradient(to right, transparent, var(--color-primary), transparent)",
            }}
          />

          <div className="p-5 flex flex-col gap-4">
            <DialogHeader>
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1"
                  style={
                    sdg
                      ? { backgroundColor: sdg.color + "25", color: sdg.color, boxShadow: `0 0 12px ${sdg.color}30`, borderColor: sdg.color + "40" }
                      : { backgroundColor: "var(--color-primary)/15", color: "var(--color-primary)" }
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                      style={
                        sdg
                          ? { backgroundColor: sdg.color }
                          : { backgroundColor: "#7c3aed" }
                      }
                    >
                      {getCategoryLabel(card.category)}
                    </span>
                    {/* Read time */}
                    <span className="flex items-center gap-1 text-[10px] text-white/50">
                      <Clock className="h-3 w-3" />
                      ~{readTime} min read
                    </span>
                  </div>
                  <DialogTitle className="text-base font-bold text-white leading-snug">
                    {card.title}
                  </DialogTitle>
                  {sdg && (
                    <DialogDescription className="mt-0.5 text-xs text-white/50">
                      SDG {sdg.id}: {sdg.name}
                    </DialogDescription>
                  )}
                  {!sdg && (
                    <DialogDescription className="sr-only">
                      Learning details for {card.title}
                    </DialogDescription>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="rounded-xl bg-white/5 border border-white/8 p-4">
              <p className="text-sm leading-relaxed text-white/80">{card.content}</p>
            </div>

            {/* ── Logical Fallacy: Real-world example + Quiz ─────────────────── */}
            {card.category === "logical-fallacy" && quiz && (
              <div className="flex flex-col gap-3">
                {/* Toggle Example/Quiz */}
                <button
                  onClick={() => { setShowExample(v => !v); setQuizAnswer(null); }}
                  className="flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/15 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Can you spot the fallacy?
                  </div>
                  {showExample ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showExample && (
                  <div className="flex flex-col gap-3 rounded-xl bg-white/5 border border-white/8 p-4">
                    <p className="text-sm text-white/80 leading-relaxed italic">"{quiz.scenario}"</p>
                    <div className="flex flex-col gap-2">
                      {quiz.options.map((opt, i) => {
                        const isSelected = quizAnswer === i;
                        const isCorrect = i === quiz.answerIdx;
                        const answered = quizAnswer !== null;
                        return (
                          <button
                            key={i}
                            disabled={answered}
                            onClick={() => setQuizAnswer(i)}
                            className={cn(
                              "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                              !answered && "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                              answered && isCorrect && "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                              answered && isSelected && !isCorrect && "border-rose-500/40 bg-rose-500/10 text-rose-300",
                              answered && !isSelected && !isCorrect && "border-white/5 bg-white/3 text-white/30"
                            )}
                          >
                            {answered ? (
                              isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : isSelected ? <XCircle className="h-4 w-4 text-rose-400 shrink-0" /> : <div className="h-4 w-4 shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-white/20 shrink-0" />
                            )}
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizAnswer !== null && (
                      <div className={cn(
                        "rounded-xl border px-3 py-2.5 text-xs leading-relaxed",
                        quizAnswer === quiz.answerIdx
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                      )}>
                        {quiz.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── General Lesson: Key Takeaways ─────────────────────────────── */}
            {card.category === "general-lesson" && takeaways && (
              <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Key Takeaways</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {takeaways.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── SDG: Official Website Link ─────────────────────────────────── */}
            {card.category === "sdg" && sdg && (
              <a
                href={`https://sdgs.un.org/goals/goal${sdg.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: sdg.color + "40",
                  backgroundColor: sdg.color + "12",
                  color: sdg.color,
                }}
              >
                <Globe className="h-4 w-4" />
                Visit Official SDG {sdg.id} Page
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            )}

            <Button
              className="w-full font-bold mt-2"
              size="lg"
              onClick={handleClose}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Done Reading
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
