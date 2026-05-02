import { create } from "zustand";

const KEY = "athion.boot";

const initial = (() => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
})();

export const useBootStore = create((set) => ({
  ready: initial,
  finishBoot: () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    set({ ready: true });
  },
  replayBoot: () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    set({ ready: false });
  },
}));
