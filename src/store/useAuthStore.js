import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * The backend uses a static x-api-key header (validateApiKey middleware).
 * apiKey is sourced from VITE_API_KEY at every load (NOT persisted) — otherwise
 * a stale empty value cached before .env existed would shadow the real one.
 * Only token/user are persisted (placeholders for a future user-bearer flow).
 */
const ENV_API_KEY = import.meta.env.VITE_API_KEY || "";

export const useAuthStore = create(
  persist(
    (set) => ({
      apiKey: ENV_API_KEY,
      token: null,
      user: null,

      setApiKey: (apiKey) => set({ apiKey }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: "athion.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        apiKey: ENV_API_KEY,
      }),
    },
  ),
);
