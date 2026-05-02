import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

const easing = [0.16, 1, 0.3, 1];

/**
 * Pill-shaped prompt suggestions.
 *
 *   variant="default" — small chips that wrap, used inside the dock.
 *   variant="hero"    — bigger pills, horizontal-scroll on mobile, wrap
 *                       on tablet+. Soft glow on hover, staggered entry.
 *
 * Clicking a chip calls `onPick(text)` which the parent forwards to
 * `useChatStore.sendMessage` — so the message is sent immediately, no
 * autofill step required.
 */
export function SuggestionChips({ items, onPick, disabled, variant = "default" }) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "w-full",
        isHero
          ? // wrap on every breakpoint so chips never trigger horizontal
            // scroll on mobile; centered + smaller pills on phones, larger
            // on md+
            "flex flex-wrap justify-center gap-1.5 md:gap-2"
          : "flex flex-wrap gap-2",
      )}
    >
      {items.map((s, i) => (
        <motion.button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * (isHero ? 0.07 : 0.04),
            duration: 0.55,
            ease: easing,
          }}
          whileHover={isHero ? { scale: 1.04, y: -2 } : { scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "inline-flex items-center gap-1 md:gap-1.5 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed max-w-full",
            "border border-white/10 bg-white/[0.04] backdrop-blur-md text-ink-dim",
            "hover:border-cyan-300/55 hover:bg-cyan-300/[0.06] hover:text-ink",
            "hover:shadow-[0_0_18px_rgba(56,180,255,0.28)]",
            isHero
              ? "px-2.5 py-1 text-[10.5px] md:px-4 md:py-2.5 md:text-sm"
              : "px-3 py-1.5 text-xs",
          )}
          data-cursor="hover"
        >
          <Sparkles
            className={cn(
              "shrink-0 text-cyan-300",
              isHero ? "size-3 md:size-3.5" : "size-3",
            )}
          />
          <span className="truncate">{s}</span>
        </motion.button>
      ))}
    </div>
  );
}
