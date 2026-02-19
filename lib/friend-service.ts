import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Friend, type FriendData } from "@/lib/models/friend";

const FRIEND_CODES_COLLECTION = "friendCodes";

function generateFriendCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXY23456789";
  let code = "DEBATE-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get or create the current user's friend code. Stored in users/{uid}.
 */
export async function getMyFriendCode(uid: string): Promise<string> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const code = snap.data().friendCode as string | undefined;
    if (code) return code;
  }

  let code: string;
  let exists = true;
  while (exists) {
    code = generateFriendCode();
    const codeRef = doc(db, FRIEND_CODES_COLLECTION, code);
    const codeSnap = await getDoc(codeRef);
    exists = codeSnap.exists();
    if (!exists) {
      await setDoc(codeRef, { uid, createdAt: serverTimestamp() });
      await setDoc(userRef, { friendCode: code }, { merge: true });
      return code;
    }
  }

  return generateFriendCode();
}

/**
 * Add a friend by their friend code. Returns the friend's profile or throws.
 */
export async function addFriendByCode(
  myUid: string,
  code: string
): Promise<Friend> {
  const normalized = code.trim().toUpperCase();
  if (!normalized.startsWith("DEBATE-") || normalized.length !== 13) {
    throw new Error("Invalid friend code format. Use DEBATE-XXXXXX");
  }

  const codeRef = doc(db, FRIEND_CODES_COLLECTION, normalized);
  const codeSnap = await getDoc(codeRef);
  if (!codeSnap.exists()) {
    throw new Error("Friend code not found. Please check and try again.");
  }

  const friendUid = codeSnap.data().uid as string;
  if (friendUid === myUid) {
    throw new Error("You cannot add yourself as a friend.");
  }

  const friendRef = doc(db, "users", friendUid);
  const friendSnap = await getDoc(friendRef);
  if (!friendSnap.exists()) {
    throw new Error("User not found.");
  }

  const myFriendsRef = doc(db, "users", myUid, "friends", friendUid);
  const existingSnap = await getDoc(myFriendsRef);
  if (existingSnap.exists()) {
    throw new Error("This user is already in your friends list.");
  }

  const friendData = friendSnap.data();
  const friendProfile: FriendData = {
    id: friendUid,
    nickname: friendData.nickname ?? "Unknown",
    bio: friendData.bio ?? "",
    avatarUrl: friendData.avatarUrl,
    debatesCount: friendData.debatesCount ?? 0,
    winsCount: friendData.winsCount ?? 0,
    interestedSdgs: friendData.interestedSdgs ?? [],
    addedAt: new Date().toISOString(),
  };

  await setDoc(myFriendsRef, {
    ...friendProfile,
    addedAt: serverTimestamp(),
  });

  return new Friend(friendProfile);
}

/**
 * Subscribe to the current user's friends list in real time.
 */
export function subscribeFriends(
  uid: string,
  callback: (friends: Friend[]) => void
): () => void {
  const q = query(
    collection(db, "users", uid, "friends"),
    orderBy("addedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const friends = snapshot.docs.map((d) => {
      const data = d.data();
      return new Friend({
        id: d.id,
        nickname: data.nickname ?? "Unknown",
        bio: data.bio ?? "",
        avatarUrl: data.avatarUrl,
        debatesCount: data.debatesCount ?? 0,
        winsCount: data.winsCount ?? 0,
        interestedSdgs: data.interestedSdgs ?? [],
        addedAt:
          data.addedAt?.toDate?.()?.toISOString() ??
          typeof data.addedAt === "string"
            ? data.addedAt
            : new Date().toISOString(),
      });
    });
    callback(friends);
  });
}

/**
 * Remove a friend from the list.
 */
export async function removeFriend(uid: string, friendId: string): Promise<void> {
  const ref = doc(db, "users", uid, "friends", friendId);
  await deleteDoc(ref);
}
