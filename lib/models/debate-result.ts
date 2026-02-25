// lib/models/debate-result.ts
// Types for AI judging, scoring, and post-debate summary.
// Weighted totals are ALWAYS computed client-side from raw scores —
// the Gemini model never outputs a final weighted total directly,
// preventing score-manipulation via prompt injection.

export interface RawScore {
  /** 0–100 – clarity, logic, depth, absence of fallacies */
  argumentStrength: number;
  /** 0–100 – direct engagement with, and rebuttal of, opposing arguments */
  rebuttalQuality: number;
  /** 0–100 – how closely arguments stay on the stated topic */
  topicRelevance: number;
  /** 0–100 – accuracy of facts, statistics, and cited information */
  evidenceAccuracy: number;
}

export interface CharityLink {
  name: string;
  description: string;
  url: string;
  /** Why this charity is relevant regardless of the user's debating stance */
  relevance: string;
}

export interface DebaterResult {
  name: string;
  role: "pro" | "con";
  raw: RawScore;
  /** Computed deterministically client-side via computeWeightedTotal() */
  weighted: number;
}

export interface DebateJudgement {
  debaterA: DebaterResult;
  debaterB: DebaterResult;
  /** Derived from weighted totals, not from model output */
  winner: "A" | "B" | "draw";
  winnerName: string;
  /** Neutral 2–3 sentence summary produced by the model */
  summary: string;
  keyTakeaways: string[];
  charities: CharityLink[];
  judgedAt: string;
}

// ---------------------------------------------------------------------------
// Scoring weights (must sum to 1.0)
// ---------------------------------------------------------------------------
export const SCORE_WEIGHTS = {
  argumentStrength: 0.30,
  rebuttalQuality:  0.30,
  topicRelevance:   0.20,
  evidenceAccuracy: 0.20,
} as const;

/**
 * Deterministic weighted total computed entirely in the client.
 * The model never sees or outputs this value, eliminating a
 * vector for score manipulation via the debate transcript.
 */
export function computeWeightedTotal(raw: RawScore): number {
  return Math.round(
    raw.argumentStrength * SCORE_WEIGHTS.argumentStrength +
    raw.rebuttalQuality  * SCORE_WEIGHTS.rebuttalQuality  +
    raw.topicRelevance   * SCORE_WEIGHTS.topicRelevance   +
    raw.evidenceAccuracy * SCORE_WEIGHTS.evidenceAccuracy,
  );
}

// ---------------------------------------------------------------------------
// Topic-specific UI content (replaces all hardcoded debate-room arrays)
// ---------------------------------------------------------------------------
export interface TopicContent {
  /** Coaching tips shown during the debate, relevant to the specific topic */
  tips: string[];
  judgeComments: {
    neutral: string[];
    proLead: string[];
    conLead: string[];
  };
}
