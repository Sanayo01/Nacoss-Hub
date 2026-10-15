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
        navy: {
          bgStart: "#0B1220",
          bgEnd: "#111827",
          card: "#131C2E",
          cardHover: "#18243B",
          border: "#1E293B",
          heading: "#F5F5F0",
          body: "#94A3B8",
          subtle: "#64748B",
        },
        mint: {
          DEFAULT: "#34D399",
          hover: "#10B981",
          light: "rgba(52, 211, 153, 0.12)",
          border: "rgba(52, 211, 153, 0.3)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
