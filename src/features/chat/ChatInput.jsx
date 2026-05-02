import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, Square } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Glassmorphic chat input.
 *
 *   variant="default" — compact, used when the chat thread is active. A
 *                       small gradient send button on the right.
 *   variant="hero"    — landing-screen treatment: bigger pill, "+" button
 *                       on the left, an optional "Plan" mono tag, and a
 *                       primary "Build now →" CTA on the right.
 *
 * Submit logic (Enter to send, Shift+Enter for newline, autosize, abort
 * via parent-passed onCancel) is identical between variants — this is
 * purely a presentational fork so the existing chat store keeps working.
 */
export function ChatInput({
  onSubmit,
  onCancel,
  busy,
  variant = "default",
  placeholder,
  submitLabel = "Send",
}) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  const isHero = variant === "hero";
  const resolvedPlaceholder =
    placeholder ?? (isHero ? "Let's build a landing page..." : "Ask Athion AI anything…");

  const autosize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, isHero ? 240 : 200)}px`;
  };

  useEffect(autosize, [value, isHero]);

  const submit = () => {
    const v = value.trim();
    if (!v || busy) return;
    onSubmit(v);
    setValue("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        "group relative flex gap-2 items-center",
        "border border-white/10 backdrop-blur-2xl",
        "bg-white/[0.04] shadow-[0_18px_48px_-18px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "transition-all duration-300",
        "hover:border-cyan-300/40 hover:shadow-[0_18px_48px_-18px_rgba(0,0,0,0.6),0_0_28px_rgba(56,180,255,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "focus-within:border-cyan-300/60 focus-within:shadow-[0_18px_48px_-18px_rgba(0,0,0,0.6),0_0_36px_rgba(56,180,255,0.32),inset_0_1px_0_rgba(255,255,255,0.08)]",
        isHero ? "rounded-3xl p-2 md:p-2.5" : "rounded-full p-1.5",
      )}
    >
      {/* Soft glow under the input */}
      <div
        aria-hidden
        className="absolute -inset-px rounded-[inherit] opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 100%, rgba(56,180,255,0.08), transparent 70%)",
        }}
      />

      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={resolvedPlaceholder}
        className={cn(
          "flex-1 bg-transparent resize-none outline-none text-ink placeholder:text-ink-mute scrollbar-none self-center",
          // Single-line textarea height tuned to the EXACT pixel height
          // of the CTA (h-11 = 44px mobile, h-12 = 48px desktop) so the
          // typed placeholder sits on the same baseline as the button.
          //   mobile: 11 + 16×1.375 + 11 = 44px ✓
          //   desktop: 12 + 18×1.375 + 12 = 48.75px ≈ 48px ✓
          isHero
            ? "min-h-[44px] md:min-h-[48px] px-3 md:px-4 py-[11px] md:py-3 text-base md:text-lg leading-snug"
            : "px-4 py-2 text-[15px] leading-6 min-h-[24px]",
        )}
      />

      {isHero && !busy && (
        <span
          className="hidden md:inline-flex shrink-0 items-center gap-1.5 px-2.5 h-12 rounded-md border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-[0.25em] text-ink-mute"
          aria-hidden
        >
          <span className="size-1 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(56,180,255,0.7)]" />
          Plan
        </span>
      )}

      {busy ? (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={onCancel}
          className={cn(
            "shrink-0 grid place-items-center bg-white/10 border border-white/15 hover:bg-white/15 transition",
            isHero
              ? "h-11 md:h-12 w-11 md:w-12 rounded-xl"
              : "size-10 rounded-full",
          )}
          aria-label="Stop"
        >
          <Square
            className={cn(isHero ? "size-4" : "size-3.5", "text-ink")}
            fill="currentColor"
          />
        </motion.button>
      ) : isHero ? (
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={cn(
            // Fixed height matches the textarea single-line height (h-11
            // mobile / h-12 desktop) so the CTA never drifts above or
            // below the input baseline.
            "shrink-0 inline-flex items-center justify-center gap-1.5 md:gap-2 rounded-xl",
            "h-11 md:h-12 px-3 md:px-4",
            "text-[13px] md:text-sm font-medium text-white whitespace-nowrap",
            "bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500",
            "shadow-[0_8px_24px_-6px_rgba(56,180,255,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]",
            "hover:shadow-[0_10px_30px_-6px_rgba(56,180,255,0.7),inset_0_1px_0_rgba(255,255,255,0.22)]",
            "active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
          )}
          data-cursor="hover"
          aria-label={submitLabel}
        >
          <span>{submitLabel}</span>
          <ArrowRight className="size-4 shrink-0" />
        </button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={submit}
          disabled={!value.trim()}
          className={cn(
            "shrink-0 grid place-items-center size-10 rounded-full transition",
            "bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 text-white",
            "shadow-[0_6px_18px_-4px_rgba(56,180,255,0.55),inset_0_1px_0_rgba(255,255,255,0.18)]",
            "hover:shadow-[0_8px_22px_-4px_rgba(56,180,255,0.75),inset_0_1px_0_rgba(255,255,255,0.22)]",
            "disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed",
          )}
          aria-label="Send"
        >
          <ArrowUp className="size-[18px]" strokeWidth={2.4} />
        </motion.button>
      )}
    </div>
  );
}
