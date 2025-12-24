// Firestore database operations
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "./client";

function ensureDb() {
  if (!db) {
    throw new Error("Firebase Firestore not initialized. Make sure you're calling this on the client side.");
  }
  return db;
}
import { SubmissionInput, NormalizedFeature, VerdictResponse, ValidationSprint } from "@/lib/domain/types";

export interface SubmissionDocument {
  createdAt: Timestamp;
  userId: string | null;
  mode: "early" | "existing";
  feature: { title: string; description: string };
  icp: { role: string; industry?: string; companySize?: string };
  goalMetric: "activation" | "retention" | "revenue" | "support";
  normalized?: NormalizedFeature;
  signals?: { trends?: { status: string }; community?: { status: string }; competitors?: { status: string } };
  verdict?: VerdictResponse;
}

export interface SprintDocument {
  createdAt: Timestamp;
  plan: ValidationSprint;
}

export async function createSubmission(data: SubmissionInput, userId: string | null = null): Promise<string> {
  const firestoreDb = ensureDb();
  const submission: Omit<SubmissionDocument, "createdAt"> & { createdAt: any } = {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(firestoreDb, "submissions"), submission);
  return docRef.id;
}

export async function getSubmission(submissionId: string): Promise<SubmissionDocument | null> {
  const firestoreDb = ensureDb();
  const docRef = doc(firestoreDb, "submissions", submissionId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as SubmissionDocument;
  }
  return null;
}

export async function updateSubmission(
  submissionId: string,
  updates: Partial<SubmissionDocument>
): Promise<void> {
  const firestoreDb = ensureDb();
  const docRef = doc(firestoreDb, "submissions", submissionId);
  await setDoc(docRef, updates, { merge: true });
}

export async function createSprint(
  submissionId: string,
  plan: ValidationSprint
): Promise<string> {
  const firestoreDb = ensureDb();
  const sprint: Omit<SprintDocument, "createdAt"> & { createdAt: any } = {
    plan,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(firestoreDb, "submissions", submissionId, "sprints"), sprint);
  return docRef.id;
}

export async function getSprint(submissionId: string, sprintId: string): Promise<SprintDocument | null> {
  const firestoreDb = ensureDb();
  const docRef = doc(firestoreDb, "submissions", submissionId, "sprints", sprintId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as SprintDocument;
  }
  return null;
}

