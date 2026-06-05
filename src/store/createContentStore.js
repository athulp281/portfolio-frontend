import { create } from "zustand";
import { useUIStore } from "./useUIStore";
import { fetchContent, saveContent } from "@/services/admin.service";

const toast = (t) => useUIStore.getState().pushToast(t);

function errMsg(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

function reindexed(items) {
  return items.map((it) => ({ ...it }));
}

/**
 * Factory for an admin content store bound to one backend resource
 * (e.g. "selected-work", "capabilities"). Holds a local editable `items` array;
 * nothing reaches production until `save()` asks the backend to commit the
 * resource's data file to GitHub (which redeploys the site on Vercel).
 *
 * @param {object} opts
 * @param {string} opts.resource  backend resource key
 * @param {Array}  opts.seed      bundled JSON used as offline fallback
 * @param {string} opts.label     human label for toasts ("selected work")
 */
export function createContentStore({ resource, seed = [], label = "content" }) {
  return create((set, get) => ({
    items: [],
    status: "idle", // idle | loading | saving
    error: null,
    dirty: false,
    loaded: false,
    lastCommit: null,

    load: async () => {
      set({ status: "loading", error: null });
      try {
        const items = await fetchContent(resource);
        set({ items: reindexed(items), status: "idle", dirty: false, loaded: true });
      } catch (err) {
        // Backend unreachable — fall back to bundled data so the UI still renders.
        set({ items: reindexed(seed), status: "idle", loaded: true, dirty: false });
        toast({
          kind: "warning",
          title: "Showing local data",
          message: `Backend unavailable (${errMsg(err, "error")}).`,
        });
      }
    },

    addItem: (item) => set((s) => ({ items: [...s.items, { ...item }], dirty: true })),

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
      set({ status: "saving", error: null });
      try {
        const res = await saveContent(resource, get().items, message);
        set({
          status: "idle",
          dirty: false,
          items: reindexed(res?.items || get().items),
          lastCommit: res?.commit || null,
        });
        toast({
          kind: "success",
          title: "Saved & committed",
          message: `${label} — Vercel is deploying to production (~1 min).`,
        });
        return true;
      } catch (err) {
        // 401/403 already cleared the token via the axios interceptor → gate shows.
        set({ status: "idle", error: errMsg(err, "Save failed") });
        return false;
      }
    },
  }));
}
