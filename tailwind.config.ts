import type { Config } from "tailwindcss";

// Design tokens — Kenang Kurinji Blueprint v2.0, Volume 4 (Design System)
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: "#D62828",
          50: "#FDECEC",
          100: "#FBD4D4",
          500: "#D62828",
          600: "#B31F1F",
          700: "#8F1919",
        },
        royal: {
          DEFAULT: "#1D4ED8",
          50: "#EAF0FD",
          500: "#1D4ED8",
          600: "#1740B0",
        },
        gold: {
          DEFAULT: "#FBBF24",
          400: "#FBBF24",
          500: "#F5A609",
        },
        neutral: {
          white: "#FAFAFA",
          slate: "#E5E7EB",
          midnight: "#111827",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      spacing: {
        "4.5": "18px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(17, 24, 39, 0.06)",
        medium: "0 6px 16px rgba(17, 24, 39, 0.10)",
        floating: "0 12px 32px rgba(17, 24, 39, 0.16)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-tap": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        bloom: {
          "0%": { transform: "scale(0.6) rotate(-8deg)", opacity: "0" },
          "60%": { transform: "scale(1.05) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "scale-tap": "scale-tap 200ms ease-out",
        bloom: "bloom 900ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
