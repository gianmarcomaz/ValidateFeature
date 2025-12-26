// Firebase client initialization
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Validate required environment variables
function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => {
      const envVarName = `NEXT_PUBLIC_FIREBASE_${key
        .replace(/([A-Z])/g, "_$1")
        .toUpperCase()}`;
      return envVarName;
    });

  if (missing.length > 0) {
    const errorMsg = `Missing required Firebase environment variables: ${missing.join(", ")}. Please check your .env.local file.`;
    if (typeof window !== "undefined") {
      console.error(errorMsg);
    }
    throw new Error(errorMsg);
  }

  return {
    apiKey: config.apiKey!,
    authDomain: config.authDomain!,
    projectId: config.projectId!,
    storageBucket: config.storageBucket!,
    messagingSenderId: config.messagingSenderId!,
    appId: config.appId!,
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

