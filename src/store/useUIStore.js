import { create } from "zustand";
import { playNotificationSound } from "@/utils/sound";

let toastId = 0;

export const useUIStore = create((set, get) => ({
  theme: "dark",
  toasts: [],
  commandOpen: false,

  pushToast: ({ kind = "info", title, message, ttl = 4000 }) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, kind, title, message }] });
    playNotificationSound(kind);
    if (ttl > 0) {
      setTimeout(() => get().dismissToast(id), ttl);
    }
    return id;
  },
  dismissToast: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  toggleCommand: (next) =>
    set({ commandOpen: typeof next === "boolean" ? next : !get().commandOpen }),
}));
