import { create } from "zustand";
import seed from "@/data/selectedWork.json";
import { useAuthStore } from "./useAuthStore";
import {
  adminLogin,
  fetchSelectedWork,
  saveSelectedWork,
} from "@/services/admin.service";

/**
 * Admin dashboard state for editing "Selected work".
 *
 * Auth: login posts email+password to the backend, which returns a JWT. The
 * token is stored in `useAuthStore` (persisted) and the axios interceptor sends
 * it on every request; a 401/403 clears it (auto-logout). Editing mutates a
 * local `items` array — nothing reaches production until `save()` asks the
 * backend to commit to GitHub (which redeploys the site on Vercel).
 */
function errMsg(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

function reindexed(items) {
  return items.map((it) => ({ ...it }));
}

export const useAdminStore = create((set, get) => ({
  items: [],
  status: "idle", // idle | loading | saving
  error: null,
  notice: null,
  dirty: false,
  loaded: false,
  lastCommit: null,

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const { token } = await adminLogin(email, password);
      useAuthStore.getState().setToken(token);
      set({ status: "idle" });
      return true;
    } catch (err) {
      set({ status: "idle", error: errMsg(err, "Login failed") });
      return false;
    }
  },

  logout: () => {
    useAuthStore.getState().clear();
    set({ error: null, notice: null, loaded: false, items: [] });
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
      // Backend unreachable — fall back to bundled data so the UI still renders.
      set({
        items: reindexed(seed),
        status: "idle",
        loaded: true,
        dirty: false,
        notice: `Showing local data — backend unavailable (${errMsg(err, "error")}).`,
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
    set({ status: "saving", error: null, notice: null });
    try {
      const res = await saveSelectedWork(get().items, message);
      set({
        status: "idle",
        dirty: false,
        items: reindexed(res?.items || get().items),
        lastCommit: res?.commit || null,
        notice: "Saved & committed — Vercel is deploying to production.",
      });
      return true;
    } catch (err) {
      // 401/403 already cleared the token via the axios interceptor → gate shows.
      set({ status: "idle", error: errMsg(err, "Save failed") });
      return false;
    }
  },
}));
