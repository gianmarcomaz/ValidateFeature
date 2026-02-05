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
 * One-time initializer - does not use subscription-based auth listeners.
 */
export async function ensureAnonymousAuth(): Promise<string | null> {
  // If we already have a user ID, return it immediately
  if (currentUserId) {
    return currentUserId;
  }

  // If auth service is not available, use local fallback
  if (!auth) {
    console.warn("Firebase auth not initialized - using local fallback");
    currentUserId = generateLocalUserId();
    return currentUserId;
  }

  // Check if Firebase already has a current user
  if (auth.currentUser) {
    currentUserId = auth.currentUser.uid;
    return currentUserId;
  }

  // If auth is already in progress, return the existing promise
  if (authPromise) {
    return authPromise;
  }

  // Create a new auth promise - one-time sign-in attempt
  authPromise = (async () => {
    try {
      const credential = await signInAnonymously(auth);
      currentUserId = credential.user.uid;
      return currentUserId;
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
      return currentUserId;
    }
  })();

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
