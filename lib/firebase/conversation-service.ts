/**
 * Firestore service for debate conversations.
 * Every player message and every AI reply is stored here so that:
 * 1. Conversation persists across sessions
 * 2. Full history can be loaded and sent to Gemini API for context when generating AI replies
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "./config";
import type { StoredConversationMessage } from "./types";

const COLLECTION = "debate_conversations";
const MESSAGES_SUBCOLLECTION = "messages";
const MAX_MESSAGES_LOAD = 500;

/** Convert Firestore doc to StoredConversationMessage (timestamp is stored as ISO string when we write). */
function docToMessage(data: DocumentData, id: string): StoredConversationMessage {
  const ts = data.timestamp;
  const timestampStr =
    typeof ts?.toDate === "function"
      ? (ts as Timestamp).toDate().toISOString()
      : typeof ts === "string"
        ? ts
        : new Date().toISOString();
  return {
    id: data.id ?? id,
    player: data.player === "con" ? "con" : "pro",
    name: data.name ?? "",
    text: data.text ?? "",
    timestamp: timestampStr,
    score: data.score,
    source: data.source === "ai" ? "ai" : "player",
    flags: data.flags,
  };
}

/**
 * Append a single message (player or AI) to the conversation for a challenge.
 * Call this every time the user sends a message or the AI replies.
 */
export async function appendConversationMessage(
  challengeId: string,
  message: Omit<StoredConversationMessage, "timestamp"> & { timestamp?: Date }
): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const convRef = doc(db, COLLECTION, challengeId);
    const messagesRef = collection(convRef, MESSAGES_SUBCOLLECTION);
    await addDoc(messagesRef, {
      id: message.id,
      player: message.player,
      name: message.name,
      text: message.text,
      timestamp: serverTimestamp(),
      score: message.score ?? null,
      source: message.source,
      flags: message.flags ?? null,
    });
    return true;
  } catch (e) {
    console.error("appendConversationMessage failed:", e);
    return false;
  }
}

/**
 * Load all messages for a debate (challenge). Used on room enter and to build transcript for Gemini.
 * Returns messages in chronological order.
 */
export async function getConversationMessages(
  challengeId: string
): Promise<StoredConversationMessage[]> {
  const db = getFirestoreDb();
  if (!db) return [];

  try {
    const convRef = doc(db, COLLECTION, challengeId);
    const messagesRef = collection(convRef, MESSAGES_SUBCOLLECTION);
    const q = query(
      messagesRef,
      orderBy("timestamp", "asc"),
      limit(MAX_MESSAGES_LOAD)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToMessage(d.data(), d.id));
  } catch (e) {
    console.error("getConversationMessages failed:", e);
    return [];
  }
}

/**
 * Ensure the conversation document exists (creates it with metadata on first message).
 * Call before appending if you want topic/updatedAt on the parent doc.
 */
export async function ensureConversationDoc(
  challengeId: string,
  topic: string
): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  const convRef = doc(db, COLLECTION, challengeId);
  // Firestore creates the document implicitly when we add a subcollection doc.
  // If you want explicit metadata, use setDoc with merge: true here.
  // For now we only use subcollection messages; parent doc is created on first append.
}
