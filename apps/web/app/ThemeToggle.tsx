"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      className="relative grid size-11 shrink-0 place-items-center rounded-[0.65rem] border-0 bg-transparent p-0 text-site-muted transition-[background-color,color,transform] duration-150 hover:bg-site-ink/5 hover:text-site-ink active:scale-[0.96] dark:hover:bg-white/7"
      type="button"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="relative block size-[1.15rem]" aria-hidden="true">
        <Sun className="absolute inset-0 size-[1.15rem] rotate-0 scale-100 stroke-[1.8] opacity-100 transition-[opacity,transform] duration-200 ease-out dark:rotate-[70deg] dark:scale-75 dark:opacity-0" />
        <Moon className="absolute inset-0 size-[1.15rem] -rotate-[70deg] scale-75 stroke-[1.8] opacity-0 transition-[opacity,transform] duration-200 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100" />
      </span>
    </button>
  );
}
