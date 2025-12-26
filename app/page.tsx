import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-white/10 text-slate-200 rounded-full text-sm font-semibold border border-white/20">
              AI-Powered Feature Validation
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">
            Validate your next feature in minutes
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Get instant verdicts on feature ideas with transparent evidence, 
            pivot suggestions, and actionable validation sprint plans.
          </p>
          
          <Link
            href="/new"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-95"
          >
            <span>Validate a Feature</span>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {/* Card 1 - Instant Verdict */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:bg-white/10 transition">
            <div className="h-10 w-10 mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <svg
                className="h-5 w-5 text-white"
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
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Instant Verdict
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Get a clear BUILD, RISKY, or DON'T BUILD recommendation 
              with confidence levels and detailed reasoning.
            </p>
          </div>

          {/* Card 2 - Transparent Evidence */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:bg-white/10 transition">
            <div className="h-10 w-10 mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <svg
                className="h-5 w-5 text-white"
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
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Transparent Evidence
            </h3>
            <p className="text-slate-300 leading-relaxed">
              See exactly how decisions are made with detailed methodology, 
              assumptions, and limitations clearly disclosed.
            </p>
          </div>

          {/* Card 3 - Validation Sprint Plan */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:bg-white/10 transition">
            <div className="h-10 w-10 mb-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-600">
              <svg
                className="h-5 w-5 text-white"
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
            <h3 className="text-xl font-bold text-slate-100 mb-3">
              Validation Sprint Plan
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Get ready-to-run validation tests, survey questions, 
              and outreach templates to increase confidence.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

