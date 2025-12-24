import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-60 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-7xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200/50">
              AI-Powered Feature Validation
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            Validate your next feature in minutes
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Get instant verdicts on feature ideas with transparent evidence, 
            pivot suggestions, and actionable validation sprint plans.
          </p>
          
          <Link
            href="/new"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <span>Validate a Feature</span>
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Tailwind Test Element - Remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg text-white text-sm text-center">
            ✅ Tailwind CSS is working! (Gradient, rounded, shadow applied)
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {/* Card 1 - Instant Verdict */}
          <Card hover className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <CardHeader className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Instant Verdict
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                Get a clear BUILD, RISKY, or DON'T BUILD recommendation 
                with confidence levels and detailed reasoning.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 - Transparent Evidence */}
          <Card hover className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <CardHeader className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Transparent Evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                See exactly how decisions are made with detailed methodology, 
                assumptions, and limitations clearly disclosed.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 - Validation Sprint Plan */}
          <Card hover className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <CardHeader className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Validation Sprint Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                Get ready-to-run validation tests, survey questions, 
                and outreach templates to increase confidence.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

