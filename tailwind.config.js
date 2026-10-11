/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080C0E",
        surface: {
          DEFAULT: "#0F151B",
          card: "#141D26",
          elevated: "#1B2733",
          border: "#243444",
        },
        brand: {
          DEFAULT: "#00E676",
          hover: "#00C853",
          dark: "#007A33",
          light: "#69F0AE",
        },
        gold: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          dark: "#B45309",
          light: "#FDE68A",
          glow: "#FBBF24",
        },
        slate: {
          text: "#F8FAFC",
          muted: "#94A3B8",
          dark: "#475569",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px -3px rgba(0, 230, 118, 0.3)",
        "glow-gold": "0 0 20px -3px rgba(245, 158, 11, 0.35)",
        "card-subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};
