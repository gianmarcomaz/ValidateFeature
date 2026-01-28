import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030712", // Deep void black
        foreground: "#f8fafc",
        // Dark aesthetic palette
        void: {
          950: "#02040a", // Almost pure black
          900: "#030712", // Base background
          800: "#0b1021", // Surface lighter
          700: "#151c2f", // Surface lighter
          600: "#1e293b", // Borders
        },
        navy: { // Keeping for backward compatibility but mapping to void
          900: "#030712",
          800: "#0b1021",
          700: "#151c2f",
          600: "#1e293b",
        },
        accent: {
          DEFAULT: "#8b5cf6", // Electric Purple
          light: "#a78bfa",
          dark: "#7c3aed",
          glow: "rgba(139, 92, 246, 0.5)",
        },
        cyan: { // Renaming teal to cyan for the neon look, giving it a glow
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
          dark: "#0891b2",
          glow: "rgba(6, 182, 212, 0.5)",
        },
        teal: { // Backward compatibility
          DEFAULT: "#06b6d4",
          light: "#22d3ee",
          dark: "#0891b2",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave": "wave 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wave: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
