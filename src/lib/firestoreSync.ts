import { db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import type { MockTestResult } from "./mockTest";
import type { SRCard } from "./spacedRepetition";

const RESULTS_KEY = "bluebottlecap_mock_results";
const SR_KEY = "bbc_sr_cards";
const STUDY_LOG_KEY = "bbc_study_log";

export async function syncMockResultToFirestore(uid: string, result: MockTestResult) {
  if (!db) return;
  try {
    const ref = doc(db, "users", uid, "mockResults", result.testId + "_" + result.completedAt.replace(/[:.]/g, "-"));
    await setDoc(ref, result);
  } catch (e) {
    console.warn("Failed to sync mock result:", e);
  }
}

export async function loadMockResultsFromFirestore(uid: string): Promise<MockTestResult[]> {
  if (!db) return [];
  try {
    const { getDocs, collection, orderBy, query, limit } = await import("firebase/firestore");
    const ref = collection(db, "users", uid, "mockResults");
    const q = query(ref, orderBy("completedAt", "desc"), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as MockTestResult);
  } catch (e) {
    console.warn("Failed to load mock results:", e);
    return [];
  }
}

export async function syncFlashcardsToFirestore(uid: string, cards: SRCard[]) {
  if (!db) return;
  try {
    const ref = doc(db, "users", uid, "studyData", "flashcards");
    await setDoc(ref, { cards, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn("Failed to sync flashcards:", e);
  }
}

export async function loadFlashcardsFromFirestore(uid: string): Promise<SRCard[] | null> {
  if (!db) return null;
  try {
    const ref = doc(db, "users", uid, "studyData", "flashcards");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return (snap.data().cards as SRCard[]) || null;
    }
    return null;
  } catch (e) {
    console.warn("Failed to load flashcards:", e);
    return null;
  }
}

export async function syncStudyLogToFirestore(uid: string, log: Record<string, number>) {
  if (!db) return;
  try {
    const ref = doc(db, "users", uid, "studyData", "studyLog");
    await setDoc(ref, { log, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Failed to sync study log:", e);
  }
}

export async function loadStudyLogFromFirestore(uid: string): Promise<Record<string, number> | null> {
  if (!db) return null;
  try {
    const ref = doc(db, "users", uid, "studyData", "studyLog");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return (snap.data().log as Record<string, number>) || null;
    }
    return null;
  } catch (e) {
    console.warn("Failed to load study log:", e);
    return null;
  }
}

export function mergeLocalAndRemote<T extends { completedAt?: string; id?: string }>(
  local: T[],
  remote: T[],
  keyFn: (item: T) => string
): T[] {
  const map = new Map<string, T>();
  for (const item of remote) map.set(keyFn(item), item);
  for (const item of local) map.set(keyFn(item), item);
  return Array.from(map.values());
}
