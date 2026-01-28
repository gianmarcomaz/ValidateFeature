// Centralized, non-secret runtime env helpers
// NOTE: This module should only expose non-sensitive values (no API keys, private keys, etc.)

type FirebaseClientEnv = {
  apiKeyPresent: boolean;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderIdPresent: boolean;
  appIdPresent: boolean;
};

type SerperEnv = {
  configured: boolean;
};

let hasLoggedDiagnostics = false;

export function getFirebaseClientEnv(): FirebaseClientEnv {
  return {
    apiKeyPresent: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderIdPresent: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appIdPresent: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function getGoogleCseEnv(): SerperEnv {
  const apiKeyPresent = !!process.env.SERPER_API_KEY;
  return {
    configured: apiKeyPresent,
  };
}

/**
 * Logs a one-time, non-sensitive snapshot of Firebase + Google project configuration.
 * Intended to be called from server-side code (e.g. API routes) for diagnostics.
 */
export function logRuntimeEnvDiagnosticsOnce(context: string) {
  if (hasLoggedDiagnostics) return;
  hasLoggedDiagnostics = true;

  const firebaseClient = getFirebaseClientEnv();
  const googleCse = getGoogleCseEnv();
  const cseKeyPrefix = process.env.SERPER_API_KEY ? process.env.SERPER_API_KEY.slice(0, 6) : null;

  console.log("[Config] Runtime env diagnostics context=", context);
  console.log("[Config] Firebase client projectId=", firebaseClient.projectId || "(undefined)");
  console.log("[Config] Firebase client authDomain=", firebaseClient.authDomain || "(undefined)");
  console.log("[Config] Firebase client storageBucket=", firebaseClient.storageBucket || "(undefined)");
  console.log("[Config] Firebase client apiKeyPresent=", firebaseClient.apiKeyPresent);
  console.log("[Config] Firebase client appIdPresent=", firebaseClient.appIdPresent);
  console.log("[Config] Firebase client messagingSenderIdPresent=", firebaseClient.messagingSenderIdPresent);

  console.log("[Config] Serper.dev configured=", googleCse.configured);
  console.log("[Config] SERPER_API_KEY present=", !!process.env.SERPER_API_KEY, "keyPrefix=", cseKeyPrefix);
}

