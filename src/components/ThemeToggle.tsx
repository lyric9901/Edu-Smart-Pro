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
        className={`touch-target gpu-animated inline-flex items-center justify-center rounded-2xl glass-card text-slate-700 transition-transform duration-300 ease-in-out hover:scale-105 dark:text-slate-100 ${className}`}
      >
        <CurrentIcon className="h-5 w-5 transition-transform duration-300 ease-in-out" />
      </button>
    );
  }

  return (
    <div
      className={`glass-card inline-flex items-center gap-1 rounded-2xl p-1 ${className}`}
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
                ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-950"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
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
