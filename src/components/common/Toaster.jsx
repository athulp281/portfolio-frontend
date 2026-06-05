import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/utils/cn";

/**
 * Global snackbar stack. Renders `useUIStore.toasts`, which are pushed from
 * anywhere — feature code via `pushToast(...)` and the axios response
 * interceptor (which toasts every API error). Mounted once in App.jsx.
 *
 * kind: "success" | "error" | "warning" | "info"
 */
const KIND = {
  success: {
    icon: CheckCircle2,
    accent: "text-neon-lime",
    ring: "border-neon-lime/30",
    bar: "bg-neon-lime",
  },
  error: {
    icon: AlertCircle,
    accent: "text-neon-pink",
    ring: "border-neon-pink/30",
    bar: "bg-neon-pink",
  },
  warning: {
    icon: AlertTriangle,
    accent: "text-amber-400",
    ring: "border-amber-400/30",
    bar: "bg-amber-400",
  },
  info: {
    icon: Info,
    accent: "text-neon-cyan",
    ring: "border-neon-cyan/30",
    bar: "bg-neon-cyan",
  },
};

export function Toaster() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const meta = KIND[t.kind] || KIND.info;
          const Icon = meta.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border bg-bg-panel/95 shadow-glass backdrop-blur-xl",
                meta.ring,
              )}
              role="status"
            >
              <div className="flex items-start gap-3 p-3.5 pr-9">
                <Icon className={cn("mt-0.5 size-5 shrink-0", meta.accent)} />
                <div className="min-w-0 flex-1">
                  {t.title && (
                    <p className="text-sm font-medium text-ink">{t.title}</p>
                  )}
                  {t.message && (
                    <p className="mt-0.5 text-sm leading-snug text-ink-dim break-words">
                      {t.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="absolute right-2 top-2 grid size-6 place-items-center rounded-md text-ink-mute transition hover:text-ink"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
              <span className={cn("absolute inset-x-0 bottom-0 h-0.5", meta.bar)} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
