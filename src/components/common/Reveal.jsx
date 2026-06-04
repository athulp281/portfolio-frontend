import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const easing = [0.16, 1, 0.3, 1];

/**
 * Reveal — generic fade-up that fires once when the element scrolls into
 * view. Crisp by design: it animates to a resting pose and then stops (no
 * continuous scroll-driven motion value), which is what keeps text from
 * rasterizing fuzzy on iOS Safari.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.8,
  once = true,
  amount = 0.3,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, ease: easing, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealText — word-by-word "curtain" reveal. Each word sits inside an
 * overflow-clipped box and slides up from below with a stagger, the
 * signature big-type entrance of editorial / agency sites.
 *
 * Pass plain text via `text`. Render the wrapper as any tag via `as`.
 */
export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.05,
  duration = 0.7,
  once = true,
  amount = 0.4,
}) {
  const words = String(text).split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      className={cn("inline-block", className)}
    >
      {words.map((word, i) => (
        // pb/-mb pair keeps descenders (g, y, p) from being clipped by the mask
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "115%" },
              visible: { y: "0%" },
            }}
            transition={{ duration, ease: easing }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
