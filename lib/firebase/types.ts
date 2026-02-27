/**
 * Types for debate conversation stored in Firestore.
 * Used to persist player and AI messages and to feed conversation history to Gemini API.
 */

export interface StoredConversationMessage {
  id: string;
  player: "pro" | "con";
  name: string;
  text: string;
  timestamp: string; // ISO date string for Firestore
  score?: number;
  /** Whether this message was from the AI opponent (vs human player). Used when building context for Gemini. */
  source: "player" | "ai";
  /** Quality flags from moderation; stored for post-debate summary. */
  flags?: Array<{ type: string; description: string }>;
}

export interface ConversationMeta {
  challengeId: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
}
