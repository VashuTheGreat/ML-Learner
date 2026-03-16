import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeId = "teal" | "violet" | "emerald" | "amber" | "rose" | "cyber" | "aurora" | "nebula" | "solaris" | "prism";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  light: string;   // primary swatch hex for the dot
  dark: string;    // dark mode swatch hex for the dot
}

export const THEMES: ThemeMeta[] = [
  { id: "teal",    name: "Teal Abyss",      light: "#124E66", dark: "#2adee4" },
  { id: "violet",  name: "Midnight Violet", light: "#5B21B6", dark: "#a78bfa" },
  { id: "emerald", name: "Emerald Peak",    light: "#065F46", dark: "#34d399" },
  { id: "amber",   name: "Amber Forge",     light: "#92400E", dark: "#fbbf24" },
  { id: "rose",    name: "Rose Storm",      light: "#9F1239", dark: "#fb7185" },
  { id: "cyber",   name: "Cyber Neon",      light: "#7C3AED", dark: "#F472B6" },
  { id: "aurora",  name: "Aurora Nova",     light: "#10b981", dark: "#059669" },
  { id: "nebula",  name: "Nebula Drift",    light: "#8b5cf6", dark: "#ec4899" },
  { id: "solaris", name: "Solaris Gold",    light: "#f59e0b", dark: "#fbbf24" },
  { id: "prism",   name: "Prism Multi",     light: "#6366f1", dark: "#10b981" },
];


interface ThemeCtx {
  themeId: ThemeId;
  isDark: boolean;
  setTheme: (id: ThemeId) => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  themeId: "teal",
  isDark: false,
  setTheme: () => {},
  toggleDark: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem("themeId") as ThemeId) ?? "teal";
  });

  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply data-theme + .dark whenever they change
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeId);
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("themeId", themeId);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [themeId, isDark]);

  const setTheme = (id: ThemeId) => setThemeId(id);
  const toggleDark = () => setIsDark((v) => !v);

  return (
    <ThemeContext.Provider value={{ themeId, isDark, setTheme, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
