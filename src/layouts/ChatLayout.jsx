import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { useChatStore } from "@/store";
import { useVisualViewportHeight } from "@/hooks/useVisualViewportHeight";

export function ChatLayout() {
  const newChat = useChatStore((s) => s.newChat);
  const hasUserMessage = useChatStore((s) =>
    s.messages.some((m) => m.role === "user"),
  );

  // Keeps --app-vh / --app-vt in sync with the keyboard-aware visual viewport
  // so the shell below can shrink and follow the iOS keyboard.
  useVisualViewportHeight();

  return (
    // The whole chat UI is pinned to the *visual* viewport rather than the
    // layout viewport. `--app-vh` / `--app-vt` are kept in sync by
    // useVisualViewportHeight (mounted in ChatWindow). Using `fixed` + a
    // translateY of the viewport's offsetTop means that when the iOS keyboard
    // opens — shrinking and panning the visual viewport — the entire shell
    // (header + chat) shrinks and follows it exactly, so the bottom-docked
    // input stays flush above the keyboard with no black dead-space below.
    <div
      className="fixed inset-x-0 top-0 flex flex-col bg-bg overflow-hidden"
      style={{
        height: "var(--app-vh, 100dvh)",
        transform: "translateY(var(--app-vt, 0px))",
      }}
    >
      <header className="shrink-0 absolute top-0 inset-x-0 z-30">
        <div className="mx-auto max-w-5xl px-3 md:px-6 py-3 flex items-center justify-between gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm text-ink-dim hover:text-ink glass border-white/10 transition"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* "New chat" — only appears once the user has actually
                started a conversation, so the landing hero isn't cluttered. */}
            <AnimatePresence>
              {hasUserMessage && (
                <motion.button
                  key="new-chat"
                  initial={{ opacity: 0, scale: 0.85, x: 12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={newChat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm text-ink glass border-white/10 hover:border-cyan-300/55 hover:shadow-[0_0_18px_rgba(56,180,255,0.3)] transition"
                  aria-label="Start a new chat"
                >
                  <Plus className="size-3.5 text-cyan-300" />
                  <span className="hidden xs:inline sm:inline">New chat</span>
                </motion.button>
              )}
            </AnimatePresence>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10">
              <span className="size-2 rounded-full bg-neon-lime shadow-[0_0_12px_#a3e635] animate-pulse" />
              <span className="text-[10px] md:text-xs font-mono text-ink-dim">
                athion.ai · online
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0 relative">
        <Outlet />
      </main>
    </div>
  );
}
