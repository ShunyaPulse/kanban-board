import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        board: {
          bg: "#f1f5f9",
          column: "#ffffff",
          card: "#ffffff",
          accent: "#3b82f6",
        },
        priority: {
          low: "#22c55e",
          medium: "#f59e0b",
          high: "#ef4444",
          critical: "#9333ea",
        },
      },
      animation: {
        "shake": "shake 0.5s ease-in-out",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
