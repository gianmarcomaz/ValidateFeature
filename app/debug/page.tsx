"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousAuth } from "@/lib/firebase/auth";
import { createSubmission, getSubmission, createSprint, listSprints } from "@/lib/firebase/db";
import { SubmissionInput } from "@/lib/domain/types";

interface HealthCheck {
  tailwind: boolean;
  envVars: {
    openai: boolean;
    firebase: boolean;
  };
  firebase: {
    auth: "pending" | "success" | "error";
    write: "pending" | "success" | "error";
    read: "pending" | "success" | "error";
    sprint: "pending" | "success" | "error";
  };
  apiRoutes: {
    normalize: "pending" | "success" | "error";
    verdict: "pending" | "success" | "error";
  };
}

export default function DebugPage() {
  const [health, setHealth] = useState<HealthCheck>({
    tailwind: false,
    envVars: {
      openai: false,
      firebase: false,
    },
    firebase: {
      auth: "pending",
      write: "pending",
      read: "pending",
      sprint: "pending",
    },
    apiRoutes: {
      normalize: "pending",
      verdict: "pending",
    },
  });

  useEffect(() => {
    // Check Tailwind
    const testEl = document.createElement("div");
    testEl.className = "bg-gradient-to-r from-purple-500 to-blue-500";
    document.body.appendChild(testEl);
    const styles = window.getComputedStyle(testEl);
    const hasGradient = styles.backgroundImage.includes("gradient") || styles.backgroundImage.includes("linear-gradient");
    document.body.removeChild(testEl);
    setHealth((prev) => ({ ...prev, tailwind: hasGradient }));

    // Check env vars (client-side, so we can only check NEXT_PUBLIC vars)
    setHealth((prev) => ({
      ...prev,
      envVars: {
        openai: !!process.env.NEXT_PUBLIC_OPENAI_KEY || false, // Won't exist, but check anyway
        firebase: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ),
      },
    }));

    // Test API routes
    testAPIRoute("/api/llm/normalize", (result) => {
      setHealth((prev) => ({ ...prev, apiRoutes: { ...prev.apiRoutes, normalize: result } }));
    });

    // Note: verdict route needs normalized input, skip for now
    setHealth((prev) => ({ ...prev, apiRoutes: { ...prev.apiRoutes, verdict: "pending" } }));

    // Test Firebase
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      // Test auth
      setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, auth: "pending" } }));
      const userId = await ensureAnonymousAuth();
      if (userId) {
        setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, auth: "success" } }));
        
        // Test write
        setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, write: "pending" } }));
        const testData: SubmissionInput = {
          mode: "early",
          feature: { title: "Debug Test Feature", description: "Testing Firebase write capability" },
          icp: { role: "Developer" },
          goalMetric: "activation",
        };
        const submissionId = await createSubmission(testData, userId);
        setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, write: "success" } }));
        
        // Test read
        setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, read: "pending" } }));
        const submission = await getSubmission(submissionId);
        if (submission && submission.featureTitle === "Debug Test Feature") {
          setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, read: "success" } }));
          
          // Test sprint subcollection
          setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, sprint: "pending" } }));
          const testSprint = {
            tests: [{
              type: "fake-door" as const,
              steps: ["Test step"],
              successThreshold: "50%",
            }],
            survey: {
              questions: [{
                question: "Test question?",
                type: "text" as const,
                required: true,
              }],
              intro: "Test survey",
            },
            outreachTemplates: [{
              platform: "email" as const,
              subject: "Test",
              body: "Test email body",
            }],
          };
          await createSprint(submissionId, testSprint);
          const sprints = await listSprints(submissionId);
          if (sprints.length > 0) {
            setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, sprint: "success" } }));
          } else {
            setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, sprint: "error" } }));
          }
        } else {
          setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, read: "error" } }));
        }
      } else {
        setHealth((prev) => ({ ...prev, firebase: { ...prev.firebase, auth: "error" } }));
      }
    } catch (error) {
      console.error("Firebase test error:", error);
      setHealth((prev) => {
        const firebase = { ...prev.firebase };
        if (firebase.auth === "pending") firebase.auth = "error";
        else if (firebase.write === "pending") firebase.write = "error";
        else if (firebase.read === "pending") firebase.read = "error";
        else if (firebase.sprint === "pending") firebase.sprint = "error";
        return { ...prev, firebase };
      });
    }
  };

  const testAPIRoute = async (route: string, callback: (result: "success" | "error") => void) => {
    try {
      const testPayload = {
        feature: { title: "Test Feature", description: "Test description" },
        icp: { role: "Test User" },
        goalMetric: "activation",
        mode: "early",
      };

      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      if (res.ok) {
        callback("success");
      } else {
        callback("error");
      }
    } catch {
      callback("error");
    }
  };

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug page disabled in production</h1>
          <p className="text-gray-600">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Debug / Health Check
        </h1>

        <div className="space-y-6">
          {/* Tailwind Check */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4 text-slate-100">Tailwind CSS</h2>
            <div className="flex items-center gap-3">
              {health.tailwind ? (
                <>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">✅ Active and working</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">❌ Not detected</span>
                </>
              )}
            </div>
            {/* Visual test */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white text-sm">
              If you see a purple-to-blue gradient, Tailwind is working!
            </div>
          </div>

          {/* Environment Variables */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4 text-slate-100">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Firebase Config:</span>
                {health.envVars.firebase ? (
                  <span className="text-green-400 font-medium">✅ Present</span>
                ) : (
                  <span className="text-yellow-400 font-medium">⚠️ Missing</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">OpenAI Key:</span>
                <span className="text-slate-400 text-sm">(Server-side only, check API routes)</span>
              </div>
            </div>
          </div>

          {/* Firebase Tests */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4 text-slate-100">Firebase Integration</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Anonymous Auth:</span>
                {health.firebase.auth === "success" && (
                  <span className="text-green-400 font-medium">✅ Working</span>
                )}
                {health.firebase.auth === "error" && (
                  <span className="text-red-400 font-medium">❌ Error</span>
                )}
                {health.firebase.auth === "pending" && (
                  <span className="text-slate-400">⏳ Checking...</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Write (Submission):</span>
                {health.firebase.write === "success" && (
                  <span className="text-green-400 font-medium">✅ Working</span>
                )}
                {health.firebase.write === "error" && (
                  <span className="text-red-400 font-medium">❌ Error</span>
                )}
                {health.firebase.write === "pending" && (
                  <span className="text-slate-400">⏳ Checking...</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Read (Submission):</span>
                {health.firebase.read === "success" && (
                  <span className="text-green-400 font-medium">✅ Working</span>
                )}
                {health.firebase.read === "error" && (
                  <span className="text-red-400 font-medium">❌ Error</span>
                )}
                {health.firebase.read === "pending" && (
                  <span className="text-slate-400">⏳ Checking...</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Sprint Subcollection:</span>
                {health.firebase.sprint === "success" && (
                  <span className="text-green-400 font-medium">✅ Working</span>
                )}
                {health.firebase.sprint === "error" && (
                  <span className="text-red-400 font-medium">❌ Error</span>
                )}
                {health.firebase.sprint === "pending" && (
                  <span className="text-slate-400">⏳ Checking...</span>
                )}
              </div>
            </div>
          </div>

          {/* API Route Health */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4 text-slate-100">API Route Health</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>/api/llm/normalize:</span>
                {health.apiRoutes.normalize === "success" && (
                  <span className="text-green-700 font-medium">✅ Working</span>
                )}
                {health.apiRoutes.normalize === "error" && (
                  <span className="text-red-700 font-medium">❌ Error</span>
                )}
                {health.apiRoutes.normalize === "pending" && (
                  <span className="text-gray-500">⏳ Checking...</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>/api/llm/verdict:</span>
                <span className="text-gray-500 text-sm">(Requires normalized input, manual test needed)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>/api/llm/sprint:</span>
                <span className="text-gray-500 text-sm">(Requires verdict input, manual test needed)</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-lg font-semibold mb-2 text-blue-900">Manual Testing</h2>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
              <li>Open browser console to see detailed error messages</li>
              <li>Check Network tab to verify API calls</li>
              <li>Test full flow: Landing → /new → Submit → /s/[id]</li>
              <li>Verify Firebase reads/writes in Firestore console</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

