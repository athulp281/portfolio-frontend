import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { useUIStore } from "./useUIStore";
import { adminLogin } from "@/services/admin.service";

/**
 * Admin AUTH store (login/logout). Content editing lives in per-resource stores
 * created by `createContentStore` (e.g. useSelectedWorkStore, useCapabilityStore).
 *
 * Auth: login posts email+password to the backend, which returns a JWT. The
 * token + email are stored in `useAuthStore` (persisted) and the axios
 * interceptor sends the token on every request; a 401/403 clears it (auto-logout).
 */
const toast = (t) => useUIStore.getState().pushToast(t);

function errMsg(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

export const useAdminStore = create((set) => ({
  status: "idle", // idle | loading
  error: null,

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const { token, email: who } = await adminLogin(email, password);
      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser({ email: who || email });
      set({ status: "idle" });
      toast({ kind: "success", title: "Signed in" });
      return true;
    } catch (err) {
      set({ status: "idle", error: errMsg(err, "Login failed") });
      return false;
    }
  },

  logout: () => {
    useAuthStore.getState().clear();
    set({ error: null });
    toast({ kind: "info", title: "Signed out" });
  },
}));
