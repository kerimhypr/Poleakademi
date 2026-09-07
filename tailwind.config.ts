import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { serif: ["var(--font-literata)", "Georgia", "serif"] },
      colors: { ink: "#0b0d10", paper: "#f2eee6", amber: "#e0a65a" },
    },
  },
  plugins: [],
} satisfies Config;
