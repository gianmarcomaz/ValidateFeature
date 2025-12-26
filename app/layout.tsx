import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FeatureValidate - Validate your next feature in minutes",
  description: "Get instant verdicts on feature ideas with transparent evidence and validation sprint plans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100`}>{children}</body>
    </html>
  );
}

