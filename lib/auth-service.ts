// lib/auth-service.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged,
    type User,
  } from "firebase/auth";
  import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
  } from "firebase/firestore";
  import { auth, db, googleProvider, firebaseReady } from "./firebase";

  function assertFirebaseReady() {
    if (!firebaseReady) {
      throw new Error(
        "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars and restart the dev server."
      );
    }
  }

  export function observeAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  export async function signUpWithEmail(
    email: string,
    password: string
  ): Promise<User> {
    assertFirebaseReady();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(cred.user);
    return cred.user;
  }
  
  export async function loginWithEmail(
    email: string,
    password: string
  ): Promise<User> {
    assertFirebaseReady();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(cred.user);
    return cred.user;
  }
  
  export async function loginWithGoogle(): Promise<User> {
    assertFirebaseReady();
    const cred = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(cred.user, { fromGoogle: true });
    return cred.user;
  }
  
  export function sendReset(email: string) {
    assertFirebaseReady();
    return sendPasswordResetEmail(auth, email);
  }
  
  async function ensureUserDoc(
    user: User,
    opts?: { fromGoogle?: boolean }
  ) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return;
  
    await setDoc(ref, {
      email: user.email ?? "",
      createdAt: serverTimestamp(),
      nickname: user.displayName ?? "",
      bio: "",
      reasonForUsing: "",
      interestedSdgs: [],
      isProfileComplete: false,
      fromGoogle: !!opts?.fromGoogle,
    });
  }