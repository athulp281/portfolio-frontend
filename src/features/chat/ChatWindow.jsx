import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHero } from "./ChatHero";
import { ChatBackgroundGlow } from "./ChatBackgroundGlow";

const easing = [0.16, 1, 0.3, 1];

/**
 * Two-state chat surface.
 *
 *   • If no user message has been sent → cinematic <ChatHero/> landing.
 *   • Once the first user message arrives → swap to a thread layout
 *     where the input is a sticky floating dock at the bottom and the
 *     header (with the "New chat" button) floats at the top, while the
 *     messages scroll beneath both with generous breathing room above
 *     and below.
 *
 * Auto-scroll: smooth when a user message lands, snappy ("auto") during
 * streaming chunks so the UI stays glued to the bottom token-by-token.
 */
export function ChatWindow() {
  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const suggestions = useChatStore((s) => s.suggestions);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const cancel = useChatStore((s) => s.cancel);

  const scrollerRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const busy = status !== "idle";
  const hasUserMessage = messages.some((m) => m.role === "user");
  const showHero = !hasUserMessage;
  const lastUserMessageId = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].id;
    }
    return null;
  })();

  // When the user sends a new message, force re-pin to bottom so their own
  // bubble is visible even if they had scrolled up reading prior history.
  useEffect(() => {
    if (!lastUserMessageId) return;
    stickToBottomRef.current = true;
    setShowJumpToBottom(false);
  }, [lastUserMessageId]);

  // Track whether the user is pinned near the bottom. While streaming we
  // only auto-scroll if they are — otherwise scroll-up gets fought by every
  // incoming token.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const THRESHOLD = 80;
    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distanceFromBottom <= THRESHOLD;
      stickToBottomRef.current = atBottom;
      setShowJumpToBottom(!atBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [showHero]);

  useEffect(() => {
    if (showHero) return;
    const el = scrollerRef.current;
    if (!el) return;
    if (!stickToBottomRef.current) return;
    const isStreaming = status === "streaming" || status === "sending";
    const id = requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: isStreaming ? "auto" : "smooth",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, showHero, status]);

  const jumpToBottom = () => {
    const el = scrollerRef.current;
    if (!el) return;
    stickToBottomRef.current = true;
    setShowJumpToBottom(false);
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  return (
    // Hard-locked to 100dvh (mobile-aware viewport) instead of `h-full`.
    // `h-full` only resolves when every ancestor has a definite height,
    // and Safari's flex-grown `<main flex-1>` can collapse it to 0 — which
    // showed up as "everything is black" because the chat surface had no
    // box and only the body bg was visible. `h-[100dvh]` ignores parent
    // height entirely, guaranteeing a full-viewport box.
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Bg sits at z-0, all chat content at z-10 so the dark radial
          can't end up painted on top of the messages. */}
      <ChatBackgroundGlow />

      <AnimatePresence mode="wait" initial={false}>
        {showHero ? (
          <ChatHero
            key="hero"
            onSubmit={sendMessage}
            suggestions={suggestions}
            busy={busy}
          />
        ) : (
          <motion.div
            key="thread"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: easing }}
            className="relative z-10 h-full w-full"
          >
            {/* Scrollable messages
                ─ Generous top padding clears the floating layout header.
                ─ Generous bottom padding clears the floating input dock so
                  the last bubble is never hidden behind it. */}
            <div
              ref={scrollerRef}
              data-lenis-prevent
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="mx-auto max-w-2xl lg:max-w-3xl w-full px-4 md:px-6 pt-20 md:pt-24 pb-44 md:pb-48 space-y-6 md:space-y-7">
                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <ChatMessage key={m.id} message={m} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Jump-to-bottom pill — only visible while the user has
                scrolled up away from the latest message. */}
            <AnimatePresence>
              {showJumpToBottom && (
                <motion.button
                  key="jump-to-bottom"
                  type="button"
                  onClick={jumpToBottom}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: easing }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-32 md:bottom-36 z-30 px-3 py-1.5 rounded-full bg-bg/80 backdrop-blur-md border border-white/10 text-xs text-ink-dim hover:text-ink hover:border-cyan-300/30 transition-colors shadow-[0_4px_16px_-4px_rgba(0,0,0,0.5)]"
                >
                  Jump to latest ↓
                </motion.button>
              )}
            </AnimatePresence>

            {/* Sticky floating input dock
                ─ A short gradient mask above it fades messages into the
                  dock instead of a hard border line. */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: easing, delay: 0.12 }}
              className="absolute bottom-0 inset-x-0 z-20 pointer-events-none"
            >
              <div className="h-16 md:h-20 bg-gradient-to-t from-bg via-bg/90 to-transparent" />
              <div className="bg-bg/40 backdrop-blur-2xl pointer-events-auto">
                <div className="mx-auto max-w-2xl lg:max-w-3xl w-full px-4 md:px-6 pt-1 pb-3 md:pb-4 space-y-2">
                  <ChatInput
                    busy={busy}
                    onSubmit={sendMessage}
                    onCancel={cancel}
                  />
                  <p className="text-center text-[10px] md:text-[11px] text-ink-mute font-mono">
                    Athion AI · trained on Athul P's portfolio · powered by RAG
                    + GPT-4o-mini
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
