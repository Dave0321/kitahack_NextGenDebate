// OOP-based LearningCard model
// You can manually add/remove cards by editing the arrays at the bottom

export type LearningCategory = "logical-fallacy" | "sdg" | "general-lesson";

export interface LearningCardData {
  id: string;
  title: string;
  description: string;
  content: string; // detailed content shown in card view
  category: LearningCategory;
  sdgId?: number; // only for SDG cards
  iconName?: string; // lucide icon name hint
}

export class LearningCard implements LearningCardData {
  id: string;
  title: string;
  description: string;
  content: string;
  category: LearningCategory;
  sdgId?: number;
  iconName?: string;

  constructor(data: LearningCardData) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.content = data.content;
    this.category = data.category;
    this.sdgId = data.sdgId;
    this.iconName = data.iconName;
  }

  getSummary(): string {
    return this.description.length > 120
      ? this.description.substring(0, 120) + "..."
      : this.description;
  }

  isSDGCard(): boolean {
    return this.category === "sdg";
  }
}

// ============================================================
// LOGICAL FALLACY CARDS
// Manually add/remove cards here.
// ============================================================

const logicalFallacyData: LearningCardData[] = [
  {
    id: "lf-1",
    title: "Ad Hominem",
    description: "Attacking the person making the argument rather than the argument itself.",
    content:
      "An ad hominem fallacy occurs when someone attacks the character, motive, or other attribute of the person making an argument rather than addressing the substance of the argument itself. For example: 'You can't trust John's opinion on climate change because he's not a scientist.' This diverts attention from the actual evidence and reasoning presented.",
    category: "logical-fallacy",
  },
  {
    id: "lf-2",
    title: "Straw Man",
    description: "Misrepresenting someone's argument to make it easier to attack.",
    content:
      "A straw man fallacy occurs when someone distorts or exaggerates another person's argument to make it easier to refute. Instead of addressing the real position, the arguer creates a weaker version (a 'straw man') and attacks that instead. For example: Person A says 'We should have stricter regulations on pollution.' Person B responds: 'Person A wants to shut down all factories and destroy the economy.'",
    category: "logical-fallacy",
  },
  {
    id: "lf-3",
    title: "Appeal to Authority",
    description: "Using an authority figure's opinion as evidence without proper justification.",
    content:
      "An appeal to authority fallacy occurs when someone cites an authority figure as evidence for a claim, but the authority is either not an expert in the relevant field, or the claim is not supported by the consensus of experts. While expert opinions are valuable, they must be relevant and well-supported. For example: 'A famous actor says this diet is the best, so it must be true.'",
    category: "logical-fallacy",
  },
  {
    id: "lf-4",
    title: "False Dilemma",
    description: "Presenting only two options when more exist.",
    content:
      "A false dilemma (or false dichotomy) occurs when an argument presents only two options as if they are the only possibilities, when in reality there are other alternatives. This oversimplification forces a choice between two extremes. For example: 'You're either with us or against us.' In reality, someone might partially agree, be neutral, or have a completely different perspective.",
    category: "logical-fallacy",
  },
  {
    id: "lf-5",
    title: "Slippery Slope",
    description: "Claiming one event will inevitably lead to extreme consequences.",
    content:
      "A slippery slope fallacy assumes that a relatively small first step will inevitably lead to a chain of related events culminating in a significant and often negative effect, without providing evidence for such a chain. For example: 'If we allow students to use calculators, next they'll rely on computers for everything and eventually forget how to think.'",
    category: "logical-fallacy",
  },
  {
    id: "lf-6",
    title: "Red Herring",
    description: "Introducing an irrelevant topic to divert attention from the original issue.",
    content:
      "A red herring is a fallacy where an irrelevant topic is introduced to divert attention from the subject being discussed. The name comes from the practice of using smoked herrings to throw off tracking dogs. For example: When asked about environmental policy, a politician responds by talking about job creation numbers instead.",
    category: "logical-fallacy",
  },
];

// ============================================================
// GENERAL LESSON CARDS
// Manually add/remove cards here.
// ============================================================

const generalLessonData: LearningCardData[] = [
  {
    id: "gl-1",
    title: "How to Source Information Correctly",
    description: "Learn the fundamentals of finding and evaluating reliable information sources.",
    content:
      "Properly sourcing information is crucial in debate and everyday decision-making. Key principles include: checking the author's credentials, verifying the publication date, cross-referencing with multiple sources, preferring peer-reviewed research, and understanding the difference between primary and secondary sources. Always look for potential conflicts of interest and consider the publication's reputation.",
    category: "general-lesson",
  },
  {
    id: "gl-2",
    title: "How to Debunk Fake News",
    description: "Essential techniques for identifying and countering misinformation.",
    content:
      "Fake news can be identified through several techniques: Check the source and its history. Look for corroboration from established news organizations. Examine the evidence presented. Consider the author's purpose and potential biases. Use fact-checking websites like Snopes, FactCheck.org, or PolitiFact. Be skeptical of sensational headlines and emotional language designed to provoke rather than inform.",
    category: "general-lesson",
  },
  {
    id: "gl-3",
    title: "How to Identify Bias and Misinformation",
    description: "Develop critical thinking skills to recognize bias in arguments and media.",
    content:
      "Bias can appear in many forms: confirmation bias (favoring information that confirms existing beliefs), selection bias (cherry-picking data), framing bias (how information is presented), and cultural bias. To identify bias, ask: Who created this content? What is their motivation? What evidence is presented and what is missing? Are alternative viewpoints acknowledged? Is the language neutral or emotionally charged?",
    category: "general-lesson",
  },
  {
    id: "gl-4",
    title: "Building a Strong Argument",
    description: "Learn the structure and elements of compelling, well-reasoned arguments.",
    content:
      "A strong argument requires: a clear thesis statement, supporting evidence from credible sources, logical reasoning connecting evidence to your claim, acknowledgment and rebuttal of counterarguments, and a compelling conclusion. Use the Toulmin model: Claim (what you're arguing), Grounds (evidence), Warrant (why the evidence supports the claim), Backing (support for the warrant), Qualifier (limitations), and Rebuttal (addressing opposing views).",
    category: "general-lesson",
  },
];

// Instantiate all cards
export const logicalFallacyCards: LearningCard[] = logicalFallacyData.map(
  (data) => new LearningCard(data)
);

export const generalLessonCards: LearningCard[] = generalLessonData.map(
  (data) => new LearningCard(data)
);

// SDG cards are auto-generated from SDG data but can be customized
import { SDG_GOALS } from "@/lib/data/sdg-data";

const sdgLearningData: LearningCardData[] = SDG_GOALS.map((sdg) => ({
  id: `sdg-learn-${sdg.id}`,
  title: `SDG ${sdg.id}: ${sdg.name}`,
  description: sdg.description,
  content: `${sdg.description} The United Nations Sustainable Development Goal ${sdg.id} — "${sdg.name}" — is part of the 2030 Agenda for Sustainable Development, adopted by all UN Member States in 2015. It provides a shared blueprint for peace and prosperity for people and the planet, now and into the future.`,
  category: "sdg" as LearningCategory,
  sdgId: sdg.id,
}));

export const sdgLearningCards: LearningCard[] = sdgLearningData.map(
  (data) => new LearningCard(data)
);

// Helpers
export function getLearningCardById(id: string): LearningCard | undefined {
  return [
    ...logicalFallacyCards,
    ...sdgLearningCards,
    ...generalLessonCards,
  ].find((card) => card.id === id);
}

export function addLogicalFallacyCard(data: LearningCardData): LearningCard {
  const card = new LearningCard({ ...data, category: "logical-fallacy" });
  logicalFallacyCards.push(card);
  return card;
}

export function addGeneralLessonCard(data: LearningCardData): LearningCard {
  const card = new LearningCard({ ...data, category: "general-lesson" });
  generalLessonCards.push(card);
  return card;
}
