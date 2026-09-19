"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const modes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export default function ThemeToggle({ compact = false, className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const activeTheme = mounted ? theme : "system";
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
        title="Toggle theme"
        className={`touch-target gpu-animated inline-flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-300 ease-in-out hover:scale-105 ${className}`}
      >
        <CurrentIcon className="h-5 w-5 transition-transform duration-300 ease-in-out" />
      </button>
    );
  }

  return (
    <div
      className={`bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 backdrop-blur-md inline-flex items-center gap-1 rounded-2xl p-1 ${className}`}
      role="group"
      aria-label="Theme preference"
    >
      {modes.map(({ value, label, icon: Icon }) => {
        const isActive = activeTheme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            title={`${label} theme`}
            className={`touch-target gpu-animated inline-flex items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition-all duration-300 ${
              isActive
                ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20 dark:bg-zinc-800 dark:text-white dark:border dark:border-zinc-700"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
            }`}
          >
            <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? "rotate-12" : "rotate-0"}`} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
