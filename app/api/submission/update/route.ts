import { NextRequest, NextResponse } from "next/server";
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
                    console.error("[SubmissionUpdate] Failed to parse service account:", err);
                    // Fall through to projectId-only init
                }
            }

            // Fallback: initialize with just project ID (works in some environments)
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
 * Server-side endpoint to update submission documents
 * Used by the background worker to update submissions
 */
export async function POST(request: NextRequest) {
    try {
        const { submissionId, updates } = await request.json();

        if (!submissionId || !updates) {
            return NextResponse.json(
                { error: "Missing submissionId or updates" },
                { status: 400 }
            );
        }

        const db = getAdminDb();
        const docRef = db.collection("submissions").doc(submissionId);

        // Clean updates (remove undefined values recursively)
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

        const cleanUpdates = cleanObject(updates);
        cleanUpdates.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(cleanUpdates);

        console.log(`[SubmissionUpdate] Updated ${submissionId}: ${Object.keys(updates).join(", ")}`);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[SubmissionUpdate] Error:", err);
        return NextResponse.json(
            { error: "Failed to update submission", message: err.message },
            { status: 500 }
        );
    }
}
