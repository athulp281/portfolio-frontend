import { create } from "zustand";

const STORAGE_KEY = "athion.theme";

/** Read the persisted theme, defaulting to dark. */
function initialTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
}

/** Reflect the theme onto <html> so the CSS-variable palette switches. */
function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

export const useThemeStore = create((set, get) => ({
  theme: initialTheme(),

  /** Apply the current theme to the DOM (call once on app mount). */
  init: () => applyTheme(get().theme),

  setTheme: (theme) => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));
