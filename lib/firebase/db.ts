// Firestore database operations
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  serverTimestamp,
  Timestamp,
  FieldValue
} from "firebase/firestore";
import { db } from "./client";
import { SubmissionInput, NormalizedFeature, VerdictResponse, ValidationSprint } from "@/lib/domain/types";

function ensureDb() {
  if (!db) {
    throw new Error("Firebase Firestore not initialized. Make sure you're calling this on the client side.");
  }
  return db;
}

// Submission document schema matching MVP requirements exactly
export interface SubmissionDocument {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string | null;
  mode: "early" | "existing";
  featureTitle: string;
  featureDescription: string;
  icpRole: string;
  icpIndustry?: string;
  companySize?: string;
  goalMetric: "activation" | "retention" | "revenue" | "support";
  normalized?: NormalizedFeature;
  signals?: {
    trends: { status: "TODO" | "complete" };
    community: { status: "TODO" | "complete" };
    competitors: { status: "TODO" | "complete" };
  };
  evidence?: any; // NormalizedEvidence from lib/evidence/types
  verdict?: VerdictResponse & { generatedAt?: Timestamp };
  status: "draft" | "verdict_ready" | "sprint_ready";
}

// Sprint document schema matching MVP requirements exactly
export interface SprintDocument {
  createdAt: Timestamp;
  generatedAt: Timestamp;
  plan: ValidationSprint;
}

/**
 * Creates a new submission document with status "draft"
 */
export async function createSubmission(data: SubmissionInput, userId: string | null = null): Promise<string> {
  const firestoreDb = ensureDb();
  const now = serverTimestamp();
  const submission: Omit<SubmissionDocument, "createdAt" | "updatedAt"> & { 
    createdAt: any; 
    updatedAt: any;
  } = {
    userId,
    mode: data.mode,
    featureTitle: data.feature.title,
    featureDescription: data.feature.description,
    icpRole: data.icp.role,
    icpIndustry: data.icp.industry,
    companySize: data.icp.companySize,
    goalMetric: data.goalMetric,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(collection(firestoreDb, "submissions"), submission);
  return docRef.id;
}

/**
 * Gets a submission document by ID
 */
export async function getSubmission(submissionId: string): Promise<SubmissionDocument | null> {
  const firestoreDb = ensureDb();
  const docRef = doc(firestoreDb, "submissions", submissionId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as SubmissionDocument;
  }
  return null;
}

/**
 * Updates submission document with merge (includes updatedAt timestamp)
 */
export async function updateSubmission(
  submissionId: string,
  updates: Partial<Omit<SubmissionDocument, "createdAt" | "updatedAt">> & { updatedAt?: any }
): Promise<void> {
  const firestoreDb = ensureDb();
  const docRef = doc(firestoreDb, "submissions", submissionId);
  const updateData = {
    ...updates,
    updatedAt: updates.updatedAt || serverTimestamp(),
  };
  await updateDoc(docRef, updateData);
}

/**
 * Updates submission with normalized feature data and sets status appropriately
 */
export async function updateSubmissionNormalized(
  submissionId: string,
  normalized: NormalizedFeature
): Promise<void> {
  await updateSubmission(submissionId, { normalized });
}

/**
 * Updates submission with verdict and sets status to "verdict_ready"
 */
export async function updateSubmissionVerdict(
  submissionId: string,
  verdict: VerdictResponse
): Promise<void> {
  await updateSubmission(submissionId, {
    verdict: {
      ...verdict,
      generatedAt: serverTimestamp() as any, // FieldValue - Firestore converts to Timestamp on read
    },
    status: "verdict_ready",
  });
}

/**
 * Updates submission with evidence data
 */
export async function updateSubmissionEvidence(
  submissionId: string,
  evidence: any
): Promise<void> {
  await updateSubmission(submissionId, { evidence });
}

/**
 * Creates a sprint document in the submissions/{id}/sprints subcollection
 * and updates submission status to "sprint_ready"
 */
export async function createSprint(
  submissionId: string,
  plan: ValidationSprint
): Promise<string> {
  const firestoreDb = ensureDb();
  const now = serverTimestamp();
  const sprint: Omit<SprintDocument, "createdAt" | "generatedAt"> & { 
    createdAt: any; 
    generatedAt: any;
  } = {
    plan,
    createdAt: now,
    generatedAt: now,
  };
  
  const docRef = await addDoc(collection(firestoreDb, "submissions", submissionId, "sprints"), sprint);
  
  // Update submission status to sprint_ready
  await updateSubmission(submissionId, { status: "sprint_ready" });
  
  return docRef.id;
}

/**
 * Gets a sprint document by submission ID and sprint ID
 */
export async function getSprint(submissionId: string, sprintId: string): Promise<SprintDocument | null> {
  const firestoreDb = ensureDb();
  const docRef = doc(firestoreDb, "submissions", submissionId, "sprints", sprintId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as SprintDocument;
  }
  return null;
}

/**
 * Lists all sprints for a submission
 */
export async function listSprints(submissionId: string): Promise<SprintDocument[]> {
  const firestoreDb = ensureDb();
  const sprintsRef = collection(firestoreDb, "submissions", submissionId, "sprints");
  const snapshot = await getDocs(sprintsRef);
  
  return snapshot.docs.map(doc => doc.data() as SprintDocument);
}

