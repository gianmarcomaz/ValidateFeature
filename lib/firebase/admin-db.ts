import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Firebase Admin singleton
let adminApp: App | null = null;

function getAdminDb() {
    if (!adminApp) {
        if (getApps().length === 0) {
            // Try to use service account from environment
            const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

            if (serviceAccountKey) {
                try {
                    const parsed = JSON.parse(serviceAccountKey);
                    adminApp = initializeApp({
                        credential: cert(parsed),
                        projectId: parsed.project_id || projectId,
                    });
                } catch (err) {
                    console.error("[AdminDB] Failed to parse service account:", err);
                    // Fall through to projectId-only init
                }
            }

            // Fallback: initialize with just project ID (works in some environments like Vercel with automatic integration, though explicit key is safer)
            if (!adminApp && projectId) {
                adminApp = initializeApp({ projectId });
            }

            if (!adminApp) {
                throw new Error("Failed to initialize Firebase Admin - no credentials available");
            }
        } else {
            adminApp = getApps()[0];
        }
    }
    return getFirestore(adminApp);
}

/**
 * Clean updates (remove undefined values recursively)
 * Firestore doesn't accept undefined values
 */
const cleanObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(cleanObject);
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            cleaned[key] = cleanObject(value);
        }
    }
    return cleaned;
};

/**
 * Updates a submission document using the Admin SDK
 * This bypasses client-side auth rules and can be called directly from server components/workers
 */
export async function updateSubmissionAdmin(submissionId: string, updates: Record<string, any>) {
    try {
        const db = getAdminDb();
        const docRef = db.collection("submissions").doc(submissionId);

        const cleanUpdates = cleanObject(updates);

        // Add server timestamp to updates
        cleanUpdates.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(cleanUpdates);
        return true;
    } catch (err: any) {
        console.error(`[AdminDB] Failed to update submission ${submissionId}:`, err);
        throw err;
    }
}
