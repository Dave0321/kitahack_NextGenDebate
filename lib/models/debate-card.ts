// lib/models/debate-card.ts

export interface DebateCardData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  fileUrl?: string;
  fileType?: "mp4" | "pdf";
  fileName?: string;
  sdgTags: number[]; // SDG IDs (max 2)
  thumbnailUrl?: string;
  category: "trending" | "continue" | "recommended";
  createdAt: string;
}

export class DebateCard implements DebateCardData {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  fileUrl?: string;
  fileType?: "mp4" | "pdf";
  fileName?: string;
  sdgTags: number[];
  thumbnailUrl?: string;
  category: "trending" | "continue" | "recommended";
  createdAt: string;

  constructor(data: DebateCardData) {
    if (data.sdgTags.length > 2) {
      throw new Error("A debate card can have at most 2 SDG tags.");
    }
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.videoUrl = data.videoUrl;
    this.fileUrl = data.fileUrl;
    this.fileType = data.fileType;
    this.fileName = data.fileName;
    this.sdgTags = data.sdgTags;
    this.thumbnailUrl = data.thumbnailUrl;
    this.category = data.category;
    this.createdAt = data.createdAt;
  }

  getSummary(): string {
    return this.description.length > 100
      ? this.description.substring(0, 100) + "..."
      : this.description;
  }

  hasVideo(): boolean {
    return !!this.videoUrl;
  }
}

// ============================================================
// HARDCODED DEBATE CARDS DATA
// ============================================================
const STORAGE_KEY_CARDS = "debate_me_cards";

const debateCardsData: DebateCardData[] = [
  {
    id: "debate-1",
    title: "Should AI Replace Teachers?",
    description: "Explore the implications of artificial intelligence in education. Can technology truly replace the human connection in learning, or should it serve as a tool to enhance teaching?",
    videoUrl: "https://www.youtube.com/watch?v=hJP5GqnTrNo",
    sdgTags: [4, 9],
    category: "trending",
    createdAt: "2026-02-15",
  },
  {
    id: "debate-2",
    title: "Is Nuclear Energy the Future?",
    description: "Debate whether nuclear energy is a viable solution for climate change. Weigh the risks of nuclear waste against the benefits of carbon-free power generation.",
    videoUrl: "https://www.youtube.com/watch?v=EhAemz1v7dQ",
    sdgTags: [7, 13],
    category: "trending",
    createdAt: "2026-02-14",
  },
  {
    id: "debate-3",
    title: "Universal Basic Income: Utopia or Disaster?",
    description: "Should governments provide a guaranteed income to all citizens? Discuss the economic, social, and ethical dimensions of UBI.",
    sdgTags: [1, 8],
    category: "trending",
    createdAt: "2026-02-13",
  },
  {
    id: "debate-4",
    title: "Fast Fashion vs Sustainability",
    description: "The fashion industry is one of the world's largest polluters. Should fast fashion be regulated or can consumer choices drive change?",
    sdgTags: [12, 13],
    category: "trending",
    createdAt: "2026-02-12",
  },
  {
    id: "debate-5",
    title: "Water as a Human Right",
    description: "Should access to clean water be guaranteed as a basic human right? Explore the ethical and practical challenges of water privatization.",
    videoUrl: "https://www.youtube.com/watch?v=oLa9MnSqjCM",
    sdgTags: [6],
    category: "continue",
    createdAt: "2026-02-10",
  },
  {
    id: "debate-6",
    title: "Gender Pay Gap: Myth or Reality?",
    description: "Analyze the data and arguments surrounding the gender pay gap. Is it a systemic issue requiring policy intervention or a result of individual choices?",
    sdgTags: [5, 8],
    category: "continue",
    createdAt: "2026-02-09",
  },
  {
    id: "debate-7",
    title: "Ocean Plastic: Who Is Responsible?",
    description: "Millions of tons of plastic end up in our oceans each year. Should corporations, governments, or individuals bear the responsibility?",
    sdgTags: [14, 12],
    category: "continue",
    createdAt: "2026-02-08",
  },
  {
    id: "debate-8",
    title: "Smart Cities: Innovation or Surveillance?",
    description: "As cities become smarter with IoT and data, where is the line between innovation for sustainability and surveillance of citizens?",
    videoUrl: "https://www.youtube.com/watch?v=Br5aJa6MkBc",
    sdgTags: [11, 9],
    category: "recommended",
    createdAt: "2026-02-07",
  },
  {
    id: "debate-9",
    title: "Deforestation and Indigenous Rights",
    description: "Should indigenous communities have the final say in protecting forests? Explore the intersection of environmental conservation and human rights.",
    sdgTags: [15, 16],
    category: "recommended",
    createdAt: "2026-02-06",
  },
  {
    id: "debate-10",
    title: "Global Vaccine Equity",
    description: "The COVID-19 pandemic exposed massive disparities in vaccine access. How do we ensure equitable distribution for future pandemics?",
    sdgTags: [3, 10],
    category: "recommended",
    createdAt: "2026-02-05",
  },
  {
    id: "debate-11",
    title: "Food Waste in Developed Nations",
    description: "Developed countries waste enough food to feed billions. What systemic changes are needed to address this paradox?",
    sdgTags: [2, 12],
    category: "recommended",
    createdAt: "2026-02-04",
  },
];

export let debateCards: DebateCard[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem(STORAGE_KEY_CARDS);
  if (stored) {
    debateCards = JSON.parse(stored).map((d: any) => new DebateCard(d));
  } else {
    debateCards = debateCardsData.map((data) => new DebateCard(data));
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(debateCards));
  }
} else {
  // SSR / Server fallback
  debateCards = debateCardsData.map((data) => new DebateCard(data));
}

// Helper functions
export function getCardsByCategory(category: "trending" | "continue" | "recommended"): DebateCard[] {
  return debateCards.filter((card) => card.category === category);
}

export function getCardById(id: string): DebateCard | undefined {
  return debateCards.find((card) => card.id === id);
}

export function addCard(data: DebateCardData): DebateCard {
  const card = new DebateCard(data);
  debateCards.push(card);
  saveCards();
  return card;
}

export function saveCards() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(debateCards));
    window.dispatchEvent(new CustomEvent("debate_me_cards_updated"));
  }
}

export function removeCard(id: string): boolean {
  const index = debateCards.findIndex((card) => card.id === id);
  if (index !== -1) {
    debateCards.splice(index, 1);
    saveCards();
    return true;
  }
  return false;
}

// RESTORE FUNCTION - Instantly brings back all hardcoded cards
export function restoreDefaultCards() {
  debateCards.length = 0; // Clear current array safely
  debateCardsData.forEach(data => debateCards.push(new DebateCard(data)));
  saveCards();
}