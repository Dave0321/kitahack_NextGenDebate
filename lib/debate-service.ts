import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { DebateCard, type DebateCardData } from "@/lib/models/debate-card";

const DEBATES_COLLECTION = "debates";

export type DebateCategory = "trending" | "continue" | "recommended";

export interface CreateDebateInput {
  title: string;
  description: string;
  videoUrl?: string;
  sdgTags: number[];
  category: DebateCategory;
  creatorId: string;
}

function docToCard(id: string, data: Record<string, unknown>): DebateCard {
  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString();

  return new DebateCard({
    id,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    videoUrl: (data.videoUrl as string) || undefined,
    sdgTags: (data.sdgTags as number[]) ?? [],
    thumbnailUrl: (data.thumbnailUrl as string) || undefined,
    category: (data.category as DebateCategory) ?? "trending",
    createdAt,
  });
}

/**
 * Subscribe to all debates in real time. Returns an unsubscribe function.
 */
export function subscribeDebates(
  callback: (cards: DebateCard[]) => void
): () => void {
  const q = query(
    collection(db, DEBATES_COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const cards = snapshot.docs.map((d) =>
      docToCard(d.id, d.data() as Record<string, unknown>)
    );
    callback(cards);
  });
}

/**
 * Create a new debate and persist to Firestore.
 */
export async function createDebate(input: CreateDebateInput): Promise<DebateCard> {
  const ref = await addDoc(collection(db, DEBATES_COLLECTION), {
    title: input.title.trim(),
    description: input.description.trim(),
    videoUrl: input.videoUrl?.trim() || null,
    sdgTags: input.sdgTags,
    category: input.category,
    creatorId: input.creatorId,
    createdAt: Timestamp.now(),
  });

  return new DebateCard({
    id: ref.id,
    title: input.title.trim(),
    description: input.description.trim(),
    videoUrl: input.videoUrl?.trim() || undefined,
    sdgTags: input.sdgTags,
    category: input.category,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Seed initial debate cards if the collection is empty.
 */
export async function seedDebatesIfEmpty(creatorId: string): Promise<void> {
  const snap = await getDocs(collection(db, DEBATES_COLLECTION));
  if (snap.size > 0) return;

  const seedData: Omit<CreateDebateInput, "creatorId">[] = [
    {
      title: "Should AI Replace Teachers?",
      description:
        "Explore the implications of artificial intelligence in education. Can technology truly replace the human connection in learning, or should it serve as a tool to enhance teaching?",
      videoUrl: "https://www.youtube.com/watch?v=hJP5GqnTrNo",
      sdgTags: [4, 9],
      category: "trending",
    },
    {
      title: "Is Nuclear Energy the Future?",
      description:
        "Debate whether nuclear energy is a viable solution for climate change. Weigh the risks of nuclear waste against the benefits of carbon-free power generation.",
      videoUrl: "https://www.youtube.com/watch?v=EhAemz1v7dQ",
      sdgTags: [7, 13],
      category: "trending",
    },
    {
      title: "Universal Basic Income: Utopia or Disaster?",
      description:
        "Should governments provide a guaranteed income to all citizens? Discuss the economic, social, and ethical dimensions of UBI.",
      sdgTags: [1, 8],
      category: "trending",
    },
    {
      title: "Fast Fashion vs Sustainability",
      description:
        "The fashion industry is one of the world's largest polluters. Should fast fashion be regulated or can consumer choices drive change?",
      sdgTags: [12, 13],
      category: "trending",
    },
    {
      title: "Water as a Human Right",
      description:
        "Should access to clean water be guaranteed as a basic human right? Explore the ethical and practical challenges of water privatization.",
      videoUrl: "https://www.youtube.com/watch?v=oLa9MnSqjCM",
      sdgTags: [6],
      category: "continue",
    },
    {
      title: "Gender Pay Gap: Myth or Reality?",
      description:
        "Analyze the data and arguments surrounding the gender pay gap. Is it a systemic issue requiring policy intervention or a result of individual choices?",
      sdgTags: [5, 8],
      category: "continue",
    },
    {
      title: "Ocean Plastic: Who Is Responsible?",
      description:
        "Millions of tons of plastic end up in our oceans each year. Should corporations, governments, or individuals bear the responsibility?",
      sdgTags: [14, 12],
      category: "continue",
    },
    {
      title: "Smart Cities: Innovation or Surveillance?",
      description:
        "As cities become smarter with IoT and data, where is the line between innovation for sustainability and surveillance of citizens?",
      videoUrl: "https://www.youtube.com/watch?v=Br5aJa6MkBc",
      sdgTags: [11, 9],
      category: "recommended",
    },
    {
      title: "Deforestation and Indigenous Rights",
      description:
        "Should indigenous communities have the final say in protecting forests? Explore the intersection of environmental conservation and human rights.",
      sdgTags: [15, 16],
      category: "recommended",
    },
    {
      title: "Global Vaccine Equity",
      description:
        "The COVID-19 pandemic exposed massive disparities in vaccine access. How do we ensure equitable distribution for future pandemics?",
      sdgTags: [3, 10],
      category: "recommended",
    },
    {
      title: "Food Waste in Developed Nations",
      description:
        "Developed countries waste enough food to feed billions. What systemic changes are needed to address this paradox?",
      sdgTags: [2, 12],
      category: "recommended",
    },
  ];

  for (const item of seedData) {
    await addDoc(collection(db, DEBATES_COLLECTION), {
      ...item,
      videoUrl: item.videoUrl ?? null,
      creatorId,
      createdAt: Timestamp.now(),
    });
  }
}
