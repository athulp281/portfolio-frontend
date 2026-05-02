import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChatInput } from "./ChatInput";
import { SuggestionChips } from "./SuggestionChips";

const easing = [0.16, 1, 0.3, 1];

const PLACEHOLDER_PROMPTS = [
  "Tell me about Athul's projects...",
  "What's his tech stack?",
  "Show me his AI work",
  "How can I get in touch?",
  "What is Athion AI?",
];

/**
 * Cycles through `items`, typing each one out one character at a time,
 * holding it, erasing it, then advancing — and starts over. Used as the
 * live placeholder for the hero's chat input.
 *
 * Rhythm:
 *   • `typeMs` is constant (no random jitter) — feels smoother and more
 *     deliberate than a humanized type.
 *   • `holdMs` is generous so the user can actually read the prompt.
 *   • `eraseMs` is fast and even — a quick wipe rather than a slow drag.
 *   • `betweenMs` is the brief pause before the next prompt starts.
 */
function useTypedPlaceholder(
  items,
  { typeMs = 65, holdMs = 2200, eraseMs = 22, betweenMs = 380 } = {},
) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!items?.length) return;
    let cancelled = false;
    let i = 0;
    let char = 0;
    let phase = "typing";
    let timeout;

    const tick = () => {
      if (cancelled) return;
      const current = items[i];
      if (phase === "typing") {
        if (char < current.length) {
          char += 1;
          setText(current.slice(0, char));
          timeout = setTimeout(tick, typeMs);
        } else {
          phase = "hold";
          timeout = setTimeout(tick, holdMs);
        }
      } else if (phase === "hold") {
        phase = "erasing";
        timeout = setTimeout(tick, 80);
      } else {
        if (char > 0) {
          char -= 1;
          setText(current.slice(0, char));
          timeout = setTimeout(tick, eraseMs);
        } else {
          i = (i + 1) % items.length;
          phase = "typing";
          timeout = setTimeout(tick, betweenMs);
        }
      }
    };

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [items, typeMs, holdMs, eraseMs, betweenMs]);

  return text;
}

/**
 * Landing-screen hero.
 *
 *   • The portrait sits scoped to the headline (TitleImageBackdrop) — it's
 *     the title's animated background, not a full viewport wallpaper.
 *   • Each foreground row enters from a different direction.
 *   • Live typed placeholder cycles through portfolio prompts.
 */
export function ChatHero({ onSubmit, suggestions, busy, brand = "Athion AI" }) {
  const placeholder = useTypedPlaceholder(PLACEHOLDER_PROMPTS);

  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.45, ease: easing } }}
      transition={{ duration: 0.6, ease: easing }}
      className="relative z-10 h-full w-full flex flex-col items-center justify-center px-4 md:px-8 py-10 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* Brand pill — drops from top */}
        <motion.div
          initial={{ y: -36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: easing, delay: 0.05 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[10px] font-mono tracking-[0.4em] uppercase text-ink-dim mb-6"
        >
          <span className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_10px_#a3e635] animate-pulse" />
          {brand} · online
        </motion.div>

        {/* Heading — relative wrapper hosts the title's image backdrop, a
            soft halo, and the gradient text itself, all stacked via z-index. */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.86, filter: "blur(16px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.95, ease: easing, delay: 0.18 }}
          className="relative font-display font-semibold tracking-tight leading-[1.05] text-center text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <TitleImageBackdrop />

          {/* Cyan→indigo halo glow pulsing behind the text, in front of
              the image so the text + halo sell as one unit. */}
          <motion.span
            aria-hidden
            className="absolute inset-0 -z-10 blur-2xl pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 70% at 50% 50%, rgba(56,180,255,0.38) 0%, rgba(99,102,241,0.22) 45%, transparent 75%)",
            }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <span className="relative z-10">
            What do you want to{" "}
            <span
              className="italic font-semibold"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 30%, #6366f1 70%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter:
                  "drop-shadow(0 0 24px rgba(56,180,255,0.6)) drop-shadow(0 0 48px rgba(99,102,241,0.4))",
              }}
            >
              know
            </span>
            ?
          </span>
        </motion.h1>

        {/* Subtitle — slides in from the LEFT */}
        <motion.p
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.85, ease: easing, delay: 0.42 }}
          className="mt-5 text-ink-dim text-sm sm:text-base md:text-lg text-center max-w-xl"
        >
          Athion AI knows Athul's stack, projects, and story — ask anything.
        </motion.p>

        {/* Input — slides in from the RIGHT */}
        <motion.div
          initial={{ x: 60, opacity: 0, scale: 0.96 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: easing, delay: 0.6 }}
          className="mt-9 md:mt-10 w-full"
        >
          <ChatInput
            variant="hero"
            placeholder={placeholder || " "}
            submitLabel="Ask now"
            onSubmit={onSubmit}
            busy={busy}
          />
        </motion.div>

        {/* Suggestion chips — rise from the BOTTOM (chips themselves stagger) */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, ease: easing, delay: 0.78 }}
          className="mt-7 w-full"
        >
          <SuggestionChips
            items={suggestions}
            onPick={(q) => onSubmit(q)}
            disabled={busy}
            variant="hero"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
 * TitleImageBackdrop — only the portrait, scoped to the headline.
 *
 * No chromatic ghosts, no scanlines, no scan bar, no grain, no corner
 * brackets, no pulse rings, no aura. Just the image with a soft entry
 * (fade + scale-down) and a gentle continuous breathing motion.
 * ========================================================================= */
function TitleImageBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 pointer-events-none"
      style={{
        width: "clamp(260px, 70vw, 540px)",
        height: "clamp(280px, 75vw, 580px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.18 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easing, delay: 0.12 }}
        className="relative w-full h-full"
      >
        <motion.img
          src="/profile1.png"
          alt=""
          aria-hidden
          draggable={false}
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full object-contain opacity-20 md:opacity-25"
        />
      </motion.div>
    </div>
  );
}
