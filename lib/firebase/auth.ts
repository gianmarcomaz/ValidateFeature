// Firebase Authentication helpers
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./client";

let authPromise: Promise<string | null> | null = null;
let currentUserId: string | null = null;

// Generate a local fallback ID when Firebase auth is unavailable
function generateLocalUserId(): string {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("validate_local_user_id") : null;
  if (stored) return stored;

  const newId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("validate_local_user_id", newId);
  }
  return newId;
}

/**
 * Ensures user is authenticated anonymously and returns user ID.
 * Falls back to a local ID if Firebase anonymous auth is not enabled.
 */
export async function ensureAnonymousAuth(): Promise<string | null> {
  // If we already have a user ID, return it
  if (currentUserId) {
    return currentUserId;
  }

  // If auth service is not available, use local fallback
  if (!auth) {
    console.warn("Firebase auth not initialized - using local fallback");
    currentUserId = generateLocalUserId();
    return currentUserId;
  }

  // If auth is already in progress, return the existing promise
  if (authPromise) {
    return authPromise;
  }

  // Create a new auth promise
  authPromise = new Promise<string | null>((resolve) => {
    if (!auth) {
      currentUserId = generateLocalUserId();
      resolve(currentUserId);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        currentUserId = user.uid;
        unsubscribe();
        resolve(user.uid);
      } else {
        // No user, try to sign in anonymously
        try {
          if (!auth) {
            currentUserId = generateLocalUserId();
            unsubscribe();
            resolve(currentUserId);
            return;
          }
          const credential = await signInAnonymously(auth);
          currentUserId = credential.user.uid;
          unsubscribe();
          resolve(credential.user.uid);
        } catch (error: any) {
          console.error("Error signing in anonymously:", error);

          // Check if anonymous auth is blocked/disabled
          if (error?.code === "auth/operation-not-allowed" ||
            error?.message?.includes("signup-are-blocked") ||
            error?.message?.includes("identitytoolkit")) {
            console.warn("Anonymous auth is disabled in Firebase. Using local fallback.");
            console.warn("To enable: Firebase Console -> Authentication -> Sign-in method -> Anonymous -> Enable");
          }

          // Fall back to local ID
          currentUserId = generateLocalUserId();
          unsubscribe();
          resolve(currentUserId);
        }
      }
    });
  });

  return authPromise;
}

/**
 * Gets the current user ID if authenticated, null otherwise.
 * Does not trigger authentication.
 */
export function getCurrentUserId(): string | null {
  if (!auth) return currentUserId || null;
  return auth.currentUser?.uid || currentUserId || null;
}
