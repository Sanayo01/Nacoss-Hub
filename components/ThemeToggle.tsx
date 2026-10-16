"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nacos-theme");
    const initialTheme: Theme = savedTheme === "light" ? "light" : "dark";
    applyTheme(initialTheme);
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("nacos-theme", nextTheme);
    setTheme(nextTheme);
  }

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = nextTheme === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="fixed bottom-20 right-4 z-[60] inline-flex min-h-touch items-center gap-2 rounded-full border border-navy-border bg-navy-card px-4 text-sm font-semibold text-navy-heading shadow-lg transition-colors hover:border-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-navy-bgStart md:bottom-5"
    >
      <Icon aria-hidden="true" className="h-4 w-4 text-mint" />
      <span>{nextTheme === "light" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
