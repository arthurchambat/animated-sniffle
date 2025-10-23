import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./public/**/*.svg",
    "./node_modules/sonner/dist/*.js"
  ],
  theme: {
    extend: {
      colors: {
        finance: {
          green: "var(--finance-green)",
          gold: "var(--accent-gold)",
          midnight: "var(--midnight)"
        }
      },
      borderRadius: {
        finance: "var(--radius)"
      },
      boxShadow: {
        "glow-green": "0 15px 45px -20px rgba(0, 135, 90, 0.75)",
        "glow-blue": "0 25px 60px -30px rgba(35, 97, 168, 0.45)"
      },
      backdropBlur: {
        finance: "18px"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
