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
          bgStart: "rgb(var(--navy-bg-start) / <alpha-value>)",
          bgEnd: "rgb(var(--navy-bg-end) / <alpha-value>)",
          card: "rgb(var(--navy-card) / <alpha-value>)",
          cardHover: "rgb(var(--navy-card-hover) / <alpha-value>)",
          border: "rgb(var(--navy-border) / <alpha-value>)",
          heading: "rgb(var(--navy-heading) / <alpha-value>)",
          body: "rgb(var(--navy-body) / <alpha-value>)",
          subtle: "rgb(var(--navy-subtle) / <alpha-value>)",
          onAccent: "rgb(var(--navy-on-accent) / <alpha-value>)",
        },
        mint: {
          DEFAULT: "rgb(var(--mint) / <alpha-value>)",
          hover: "rgb(var(--mint-hover) / <alpha-value>)",
          light: "rgb(var(--mint) / 0.12)",
          border: "rgb(var(--mint) / 0.3)",
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
  darkMode: "class",
  plugins: [],
};

export default config;
