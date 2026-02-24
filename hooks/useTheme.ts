"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Theme,
  applyTheme,
  getSavedTheme,
  saveTheme,
  getSystemTheme,
} from "@/lib/theme";

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const [activeTheme, setActiveTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Initialise from localStorage on mount (client only)
  useEffect(() => {
    const saved = getSavedTheme();
    setActiveTheme(saved);
    applyTheme(saved);
    setResolvedTheme(saved === "system" ? getSystemTheme() : saved);
  }, []);

  // React to OS colour-scheme changes when theme is "system"
  useEffect(() => {
    if (activeTheme !== "system") return;

    const mq = globalThis.window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const sys = getSystemTheme();
      setResolvedTheme(sys);
      applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [activeTheme]);

  const setTheme = useCallback((next: Theme) => {
    setActiveTheme(next);
    saveTheme(next);
    applyTheme(next);
    setResolvedTheme(next === "system" ? getSystemTheme() : next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return { theme: activeTheme, resolvedTheme, setTheme, toggleTheme };
}
