import { create } from "zustand";
import {
  fetchPersonalDetails,
  fetchSocialDetails,
} from "@/services/profile.service";
import selectedWork from "@/data/selectedWork.json";

/**
 * Profile + featured projects ("Selected work").
 * Personal + social are loaded from backend; the project showcase list is the
 * static `src/data/selectedWork.json` file — the single source of truth that the
 * landing page renders and the /admin view edits. Saving in the admin commits
 * that file back to GitHub, which redeploys the site on Vercel.
 */
const FEATURED_PROJECTS = selectedWork;

export const useProjectStore = create((set) => ({
  personal: [],
  social: [],
  projects: FEATURED_PROJECTS,
  status: "idle",
  error: null,

  loadProfile: async () => {
    set({ status: "loading", error: null });
    try {
      const [personal, social] = await Promise.all([
        fetchPersonalDetails(),
        fetchSocialDetails(),
      ]);
      set({
        personal: personal ?? [],
        social: social ?? [],
        status: "idle",
      });
    } catch (err) {
      set({ status: "error", error: err?.message || "Failed to load profile" });
    }
  },
}));
