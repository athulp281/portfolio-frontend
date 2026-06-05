import { create } from "zustand";
import seed from "@/data/selectedWork.json";
import {
  adminLogin,
  fetchSelectedWork,
  saveSelectedWork,
} from "@/services/admin.service";

/**
 * Admin dashboard state for editing "Selected work".
 *
 * Auth: the password is held in memory + sessionStorage (cleared on tab close)
 * and re-verified server-side on every save. Editing mutates a local `items`
 * array; nothing reaches production until `save()` commits to GitHub.
 *
 * Local-dev note: the `/api/*` functions only run on Vercel (or `vercel dev`).
 * Under plain `npm run dev`, `load()` falls back to the bundled JSON so the UI
 * is still previewable, but `save()` will fail until deployed.
 */
const PW_KEY = "athion.admin.pw";

function readStoredPassword() {
  try {
    return sessionStorage.getItem(PW_KEY) || "";
  } catch {
    return "";
  }
}

function reindexed(items) {
  // Clone to a fresh array so React/zustand sees a new reference.
  return items.map((it) => ({ ...it }));
}

export const useAdminStore = create((set, get) => ({
  authed: false,
  password: "",
  items: [],
  status: "idle", // idle | loading | saving
  error: null,
  notice: null,
  dirty: false,
  loaded: false,
  lastCommit: null,

  /** Re-hydrate auth from sessionStorage on mount (optimistic; save re-verifies). */
  restore: () => {
    const pw = readStoredPassword();
    if (pw) set({ authed: true, password: pw });
    return !!pw;
  },

  login: async (password) => {
    set({ status: "loading", error: null });
    try {
      await adminLogin(password);
      try {
        sessionStorage.setItem(PW_KEY, password);
      } catch {
        /* sessionStorage unavailable — keep in memory only */
      }
      set({ authed: true, password, status: "idle" });
      return true;
    } catch (err) {
      set({ status: "idle", error: err.message || "Login failed" });
      return false;
    }
  },

  logout: () => {
    try {
      sessionStorage.removeItem(PW_KEY);
    } catch {
      /* ignore */
    }
    set({ authed: false, password: "", error: null, notice: null });
  },

  load: async () => {
    set({ status: "loading", error: null, notice: null });
    try {
      const items = await fetchSelectedWork();
      set({
        items: reindexed(items),
        status: "idle",
        dirty: false,
        loaded: true,
      });
    } catch (err) {
      // API unavailable (e.g. local dev) — fall back to bundled data.
      set({
        items: reindexed(seed),
        status: "idle",
        loaded: true,
        dirty: false,
        notice: `Showing local data — live API unavailable (${err.message}).`,
      });
    }
  },

  // --- local CRUD (no network) -------------------------------------------
  addItem: (item) =>
    set((s) => ({ items: [...s.items, { ...item }], dirty: true })),

  updateItem: (id, patch) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      dirty: true,
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((it) => it.id !== id), dirty: true })),

  moveItem: (id, dir) =>
    set((s) => {
      const idx = s.items.findIndex((it) => it.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= s.items.length) return s;
      const items = [...s.items];
      [items[idx], items[next]] = [items[next], items[idx]];
      return { items, dirty: true };
    }),

  save: async (message) => {
    const { items, password } = get();
    set({ status: "saving", error: null, notice: null });
    try {
      const res = await saveSelectedWork(items, password, message);
      set({
        status: "idle",
        dirty: false,
        items: reindexed(res.items || items),
        lastCommit: res.commit || null,
        notice: "Saved & committed — Vercel is deploying to production.",
      });
      return true;
    } catch (err) {
      if (err.status === 401) {
        get().logout();
        set({ error: "Session expired — please log in again." });
      } else {
        set({ status: "idle", error: err.message || "Save failed" });
      }
      return false;
    }
  },
}));
