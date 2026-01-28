// Firebase client initialization
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFirebaseClientEnv } from "@/lib/config/env";

// Validate required environment variables and build Firebase config
function getFirebaseConfig() {
  const env = getFirebaseClientEnv();

  const missing: string[] = [];
  if (!env.apiKeyPresent) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!env.authDomain) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!env.projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!env.storageBucket) missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!env.messagingSenderIdPresent) missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!env.appIdPresent) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  if (missing.length > 0) {
    const errorMsg = `Missing required Firebase environment variables: ${missing.join(", ")}. Please check your .env.local file.`;
    if (typeof window !== "undefined") {
      console.error(errorMsg);
    }
    throw new Error(errorMsg);
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
    authDomain: env.authDomain as string,
    projectId: env.projectId as string,
    storageBucket: env.storageBucket as string,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  };
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
  // Initialize Firebase only on client side
  try {
    const firebaseConfig = getFirebaseConfig();
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Allow app to continue, but Firebase operations will fail gracefully
  }
}

export { app, auth, db };
export default app;

