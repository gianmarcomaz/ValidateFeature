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
import { SubmissionInput, NormalizedFeature, VerdictResponse, ValidationSprint, StartupContext, FeatureContext } from "@/lib/domain/types";

function ensureDb() {
  if (!db) {
    throw new Error("Firebase Firestore not initialized. Make sure you're calling this on the client side.");
  }
  return db;
}

// Submission document schema - backward compatible
export interface SubmissionDocument {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string | null;
  mode: "early" | "existing";
  // Legacy fields (kept for backward compatibility)
  featureTitle?: string;
  featureDescription?: string;
  icpRole: string;
  icpIndustry?: string;
  companySize?: string;
  goalMetric: "activation" | "retention" | "revenue" | "support";
  // New fields (startup + feature context)
  startup?: {
    source: "manual" | "website";
    websiteUrl?: string;
    name: string;
    description: string;
    whatItDoes: string;
    problemSolved: string;
    targetAudience: string;
    businessModel?: string;
    differentiators?: string[];
    websiteEvidence?: {
      fetchedAt: number;
      pages: Array<{ url: string; title?: string; snippet: string }>;
      warnings?: string[];
    };
  };
  feature?: {
    title: string;
    description: string;
    problemSolved: string;
    targetAudience: string;
  };
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
  
  // Build submission with backward compatibility
  // Only include defined fields (Firestore doesn't accept undefined)
  const submission: Omit<SubmissionDocument, "createdAt" | "updatedAt"> & { 
    createdAt: any; 
    updatedAt: any;
  } = {
    userId,
    mode: data.mode,
    icpRole: data.icp.role,
    goalMetric: data.goalMetric,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  
  // Only include optional ICP fields if they're defined
  if (data.icp.industry !== undefined) {
    submission.icpIndustry = data.icp.industry;
  }
  if (data.icp.companySize !== undefined) {
    submission.companySize = data.icp.companySize;
  }
  
  // Add new startup + feature context if provided
  // Remove undefined values (Firestore doesn't accept undefined)
  if (data.startup) {
    const cleanStartup: any = {};
    // Only include defined fields
    if (data.startup.source !== undefined) cleanStartup.source = data.startup.source;
    if (data.startup.websiteUrl !== undefined) cleanStartup.websiteUrl = data.startup.websiteUrl;
    if (data.startup.name !== undefined) cleanStartup.name = data.startup.name;
    if (data.startup.description !== undefined) cleanStartup.description = data.startup.description;
    if (data.startup.whatItDoes !== undefined) cleanStartup.whatItDoes = data.startup.whatItDoes;
    if (data.startup.problemSolved !== undefined) cleanStartup.problemSolved = data.startup.problemSolved;
    if (data.startup.targetAudience !== undefined) cleanStartup.targetAudience = data.startup.targetAudience;
    if (data.startup.businessModel !== undefined) cleanStartup.businessModel = data.startup.businessModel;
    if (data.startup.differentiators !== undefined && data.startup.differentiators.length > 0) {
      cleanStartup.differentiators = data.startup.differentiators;
    }
    if (data.startup.websiteEvidence !== undefined) {
      cleanStartup.websiteEvidence = data.startup.websiteEvidence;
    }
    submission.startup = cleanStartup;
  }
  if (data.feature) {
    const cleanFeature: any = {};
    // Only include defined fields
    if (data.feature.title !== undefined) cleanFeature.title = data.feature.title;
    if (data.feature.description !== undefined) cleanFeature.description = data.feature.description;
    if (data.feature.problemSolved !== undefined) cleanFeature.problemSolved = data.feature.problemSolved;
    if (data.feature.targetAudience !== undefined) cleanFeature.targetAudience = data.feature.targetAudience;
    submission.feature = cleanFeature;
  }
  
  // Legacy fields for backward compatibility (if new fields not provided)
  if (!data.startup && !data.feature) {
    submission.featureTitle = (data.feature as any)?.title || "";
    submission.featureDescription = (data.feature as any)?.description || "";
  }
  
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
 * Helper function to remove undefined values from an object (Firestore doesn't accept undefined)
 */
function removeUndefinedValues(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues);
  }
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = removeUndefinedValues(obj[key]);
    }
  }
  return cleaned;
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
  // Remove undefined values before updating (Firestore doesn't accept undefined)
  const cleanedUpdates = removeUndefinedValues(updates);
  const updateData = {
    ...cleanedUpdates,
    updatedAt: cleanedUpdates.updatedAt || serverTimestamp(),
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

