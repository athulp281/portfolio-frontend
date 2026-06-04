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
 * holding it, erasing it, then advancing — used as the live placeholder for
 * the hero's chat input.
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
 * Chat landing — editorial restyle to match the site. A small status label,
 * an oversized headline with an italic serif accent, a one-line intro, the
 * hero chat input (with a live typed placeholder), and suggestion chips.
 * Fully theme-aware (ink / line / accent tokens).
 */
export function ChatHero({ onSubmit, suggestions, busy, brand = "Athion AI" }) {
  const placeholder = useTypedPlaceholder(PLACEHOLDER_PROMPTS);

  return (
    <motion.div
      key="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -32, transition: { duration: 0.45, ease: easing } }}
      transition={{ duration: 0.6, ease: easing }}
      className="relative z-10 h-full w-full flex flex-col items-center justify-center px-5 md:px-8 py-10 overflow-hidden"
    >
      {/* Background portrait — dimmed + scrimmed so the headline/input stay
          readable in both themes. */}
      <div aria-hidden className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.img
          src="/C1E0AC65-0655-4204-9DF6-BE916A4A9DBB.png"
          alt=""
          draggable={false}
          initial={{ scale: 1.04, opacity: 0 }}
          // NOTE: framer's animate opacity sets an inline style that overrides
          // any Tailwind `opacity-[..]` class — so the final opacity is set
          // HERE (change this number to tune visibility).
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.4, ease: easing }}
          // object-contain zooms out so the whole portrait (full figure + face)
          // is visible; the radial mask feathers its edges so it blends into
          // the background colour instead of looking like a pasted photo.
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            objectPosition: "center 28%",
            filter: "contrast(1.04)",
            WebkitMaskImage:
              "radial-gradient(60% 68% at 50% 40%, #000 32%, transparent 80%)",
            maskImage:
              "radial-gradient(60% 68% at 50% 40%, #000 32%, transparent 80%)",
          }}
        />
        {/* Soft bottom fade only — keeps the input/chips readable without
            washing out the now-blended portrait. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 45%, rgb(var(--bg) / 0.55) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Status label */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: easing, delay: 0.05 }}
          className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-dim mb-8"
        >
          <span className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_10px_#a3e635] animate-pulse" />
          {brand} · online
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easing, delay: 0.16 }}
          className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-ink text-[clamp(2.5rem,8vw,6rem)]"
        >
          What do you want to{" "}
          <span
            className="italic font-normal"
            style={{
              fontFamily: "'Playfair Display', serif",
              backgroundImage:
                "linear-gradient(120deg, #7dd3fc, #38bdf8 40%, #6366f1 80%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            know?
          </span>
        </motion.h1>

        {/* Intro line */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easing, delay: 0.34 }}
          className="mt-6 text-ink-dim text-base md:text-lg max-w-xl leading-relaxed"
        >
          Ask Athion AI about Athul's stack, projects, and story — grounded in
          his real work and answered in real time.
        </motion.p>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: easing, delay: 0.5 }}
          className="mt-10 w-full"
        >
          <ChatInput
            variant="hero"
            placeholder={placeholder || " "}
            submitLabel="Ask"
            onSubmit={onSubmit}
            busy={busy}
          />
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easing, delay: 0.66 }}
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
