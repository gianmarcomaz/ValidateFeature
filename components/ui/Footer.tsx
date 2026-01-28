import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-navy-900">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-white">Validate</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-8 text-sm text-slate-500">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/new" className="hover:text-white transition-colors">
                            New Validation
                        </Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-slate-600">
                        © {new Date().getFullYear()} Validate
                    </p>
                </div>
            </div>
        </footer>
    );
}
