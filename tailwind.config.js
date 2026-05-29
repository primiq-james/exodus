/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ← This is correct (covers both .js and .tsx)
  ],
  darkMode: "class", // ← Explicit dark mode (good for your black theme)
  theme: {
    extend: {
      // Fonts – very close to Stability.ai style
      fontFamily: {
        sans: ["Hero", "system-ui", "sans-serif"],
        heading: ["Hero", "system-ui", "sans-serif"],
        hero: ["Hero", "system-ui", "sans-serif"],
      },

      // Colors – inspired by Stability.ai (deep darks, purple/blue neon)
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#3b82f6", // blue-500
          600: "#2563eb",
          700: "#1d4ed8",
        },
        accent: {
          500: "#7c3aed", // purple-600-ish
          600: "#6d28d9",
          700: "#5b21b6",
        },
        dark: {
          900: "#0a0a0a",
          950: "#030712",
        },
        neon: {
          purple: "#a855f7",
          blue: "#60a5fa",
        },
      },

      // Custom spacing
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        28: "7rem",
      },

      // Shadows – modern + neon
      boxShadow: {
        card: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px 5px rgba(168, 85, 247, 0.3)",
        "glow-blue": "0 0 20px 5px rgba(96, 165, 250, 0.3)",
      },

      // Softer modern corners
      borderRadius: {
        "4xl": "2rem",
      },

      // Letter spacing for headings
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"), // ← REQUIRED for prose classes!
  ],
};
