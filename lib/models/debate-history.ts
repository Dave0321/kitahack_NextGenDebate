// OOP-based DebateHistory model
// Manages debate history records for user profile

export type DebateResult = "win" | "loss" | "draw";

export interface DebateHistoryData {
  id: string;
  topicTitle: string;
  opponentName: string;
  result: DebateResult;
  sdgTags: number[];
  userSide: "for" | "against";
  date: string;
  durationMinutes: number;
  score?: { user: number; opponent: number };
}

export class DebateHistory implements DebateHistoryData {
  id: string;
  topicTitle: string;
  opponentName: string;
  result: DebateResult;
  sdgTags: number[];
  userSide: "for" | "against";
  date: string;
  durationMinutes: number;
  score?: { user: number; opponent: number };

  constructor(data: DebateHistoryData) {
    this.id = data.id;
    this.topicTitle = data.topicTitle;
    this.opponentName = data.opponentName;
    this.result = data.result;
    this.sdgTags = data.sdgTags;
    this.userSide = data.userSide;
    this.date = data.date;
    this.durationMinutes = data.durationMinutes;
    this.score = data.score;
  }

  getResultLabel(): string {
    switch (this.result) {
      case "win":
        return "Victory";
      case "loss":
        return "Defeat";
      case "draw":
        return "Draw";
    }
  }

  getFormattedDate(): string {
    return new Date(this.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  getDurationLabel(): string {
    if (this.durationMinutes < 60) return `${this.durationMinutes}m`;
    const hours = Math.floor(this.durationMinutes / 60);
    const mins = this.durationMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getScoreDisplay(): string {
    if (!this.score) return "-";
    return `${this.score.user} - ${this.score.opponent}`;
  }
}

// ============================================================
// DUMMY DEBATE HISTORY DATA - Manually add/remove here
// ============================================================

const historyData: DebateHistoryData[] = [
  {
    id: "history-1",
    topicTitle: "Should AI Replace Teachers?",
    opponentName: "CriticalThinker42",
    result: "win",
    sdgTags: [4, 9],
    userSide: "against",
    date: "2026-02-16",
    durationMinutes: 25,
    score: { user: 82, opponent: 71 },
  },
  {
    id: "history-2",
    topicTitle: "Universal Basic Income: Utopia or Disaster?",
    opponentName: "DebateChamp2026",
    result: "loss",
    sdgTags: [1, 8],
    userSide: "for",
    date: "2026-02-14",
    durationMinutes: 30,
    score: { user: 68, opponent: 79 },
  },
  {
    id: "history-3",
    topicTitle: "Is Nuclear Energy the Future?",
    opponentName: "GreenAdvocate",
    result: "win",
    sdgTags: [7, 13],
    userSide: "for",
    date: "2026-02-12",
    durationMinutes: 20,
    score: { user: 85, opponent: 62 },
  },
  {
    id: "history-4",
    topicTitle: "Water as a Human Right",
    opponentName: "SDGExplorer",
    result: "draw",
    sdgTags: [6],
    userSide: "for",
    date: "2026-02-10",
    durationMinutes: 35,
    score: { user: 74, opponent: 74 },
  },
  {
    id: "history-5",
    topicTitle: "Fast Fashion vs Sustainability",
    opponentName: "LogicMaster",
    result: "win",
    sdgTags: [12, 13],
    userSide: "against",
    date: "2026-02-08",
    durationMinutes: 22,
    score: { user: 88, opponent: 65 },
  },
  {
    id: "history-6",
    topicTitle: "Gender Pay Gap: Myth or Reality?",
    opponentName: "CriticalThinker42",
    result: "win",
    sdgTags: [5, 8],
    userSide: "for",
    date: "2026-02-05",
    durationMinutes: 28,
    score: { user: 77, opponent: 70 },
  },
  {
    id: "history-7",
    topicTitle: "Smart Cities: Innovation or Surveillance?",
    opponentName: "DebateChamp2026",
    result: "loss",
    sdgTags: [11, 9],
    userSide: "against",
    date: "2026-02-02",
    durationMinutes: 40,
    score: { user: 60, opponent: 81 },
  },
  {
    id: "history-8",
    topicTitle: "Global Vaccine Equity",
    opponentName: "GreenAdvocate",
    result: "win",
    sdgTags: [3, 10],
    userSide: "for",
    date: "2026-01-28",
    durationMinutes: 18,
    score: { user: 90, opponent: 58 },
  },
];

// Instantiate all history records
export const debateHistoryRecords: DebateHistory[] = historyData.map(
  (data) => new DebateHistory(data)
);

// Helper functions
export function getDebateHistory(): DebateHistory[] {
  return [...debateHistoryRecords];
}

export function addDebateHistory(data: DebateHistoryData): DebateHistory {
  const record = new DebateHistory(data);
  debateHistoryRecords.unshift(record);
  return record;
}

export function getWinCount(): number {
  return debateHistoryRecords.filter((r) => r.result === "win").length;
}

export function getLossCount(): number {
  return debateHistoryRecords.filter((r) => r.result === "loss").length;
}

export function getDrawCount(): number {
  return debateHistoryRecords.filter((r) => r.result === "draw").length;
}

export function getTotalDebates(): number {
  return debateHistoryRecords.length;
}
