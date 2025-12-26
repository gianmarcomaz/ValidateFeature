// Firebase Authentication helpers
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./client";

let authPromise: Promise<string | null> | null = null;
let currentUserId: string | null = null;

/**
 * Ensures user is authenticated anonymously and returns user ID.
 * This function is idempotent - calling it multiple times returns the same promise.
 */
export async function ensureAnonymousAuth(): Promise<string | null> {
  if (!auth) {
    console.warn("Firebase auth not initialized");
    return null;
  }

  // If we already have a user ID, return it
  if (currentUserId) {
    return currentUserId;
  }

  // If auth is already in progress, return the existing promise
  if (authPromise) {
    return authPromise;
  }

  // Create a new auth promise
  authPromise = new Promise<string | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        currentUserId = user.uid;
        unsubscribe();
        resolve(user.uid);
      } else {
        // No user, sign in anonymously
        try {
          const credential = await signInAnonymously(auth);
          currentUserId = credential.user.uid;
          unsubscribe();
          resolve(credential.user.uid);
        } catch (error) {
          console.error("Error signing in anonymously:", error);
          unsubscribe();
          resolve(null);
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
  if (!auth) return null;
  return auth.currentUser?.uid || currentUserId || null;
}

