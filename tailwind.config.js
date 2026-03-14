const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        muted: "var(--surface-muted)",
        border: "var(--border)",
        text: "var(--text)",
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans]
      },
      boxShadow: {
        glass: "0 15px 45px rgba(17, 94, 195, 0.12)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
