"use client";

import { useEffect, useState } from "react";

interface HealthCheck {
  tailwind: boolean;
  envVars: {
    openai: boolean;
    firebase: boolean;
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
  }, []);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Debug / Health Check
        </h1>

        <div className="space-y-6">
          {/* Tailwind Check */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Tailwind CSS</h2>
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
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Firebase Config:</span>
                {health.envVars.firebase ? (
                  <span className="text-green-700 font-medium">✅ Present</span>
                ) : (
                  <span className="text-yellow-700 font-medium">⚠️ Missing</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>OpenAI Key:</span>
                <span className="text-gray-500 text-sm">(Server-side only, check API routes)</span>
              </div>
            </div>
          </div>

          {/* API Route Health */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">API Route Health</h2>
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

