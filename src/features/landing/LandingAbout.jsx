import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { VelocityMarquee } from "@/components/common/Marquee";
import { Reveal, RevealText } from "@/components/common/Reveal";
import { SectionBackdrop } from "@/components/common/SectionBackdrop";

const KEYWORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "OpenAI",
  "RAG",
  "Framer Motion",
  "Tailwind",
  "Prisma",
  "Three.js",
];

const STATS = [
  { value: "4+", label: "Years building" },
  { value: "12+", label: "Projects shipped" },
  { value: "RAG", label: "AI systems" },
  { value: "FE · BE", label: "Full stack" },
];

/**
 * About — velocity marquee, an oversized word-revealed statement, a bio, and a
 * row of stats where EACH number has its own scroll-driven entrance:
 *   0 · clip wipe (left → right)
 *   1 · 3D flip up
 *   2 · zoom + de-blur
 *   3 · masked rise + letter-spacing settle
 * All ease into an identity rest pose (so the text stays crisp once settled).
 */
export function LandingAbout() {
  return (
    <section id="intro" className="relative w-full py-24 md:py-36">
      <SectionBackdrop src="/profile6.png" position="right" opacity={0.24} />

      <VelocityMarquee
        items={KEYWORDS}
        baseVelocity={2.5}
        className="border-y border-line/10 py-5 md:py-7 mb-24 md:mb-36"
        itemClassName="font-display text-2xl md:text-4xl font-medium text-ink/80"
      />

      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <Reveal className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute mb-10">
          (02) — About
        </Reveal>

        <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.02] text-[clamp(2rem,6vw,5rem)] max-w-5xl">
          <RevealText text="I build AI-native products end to end —" className="text-ink" />{" "}
          <RevealText
            text="from the pixel to the pipeline."
            className="text-ink-mute"
            delay={0.15}
          />
        </h2>

        <Reveal className="mt-12 md:mt-16 max-w-2xl text-ink-dim text-base md:text-lg leading-relaxed">
          I'm a full-stack developer based in Kerala, India. For the last four
          years I've shipped scalable React / Next.js apps and Node services —
          and lately, AI-augmented products powered by OpenAI and custom RAG
          pipelines. Athion AI, the assistant on this site, is one of them.
        </Reveal>

        {/* Stats — one seed card that splits into four on scroll. */}
        <SplitStats />
      </div>
    </section>
  );
}

/**
 * SplitStats — a sticky-pinned, scroll-driven reveal. It opens as ONE card with
 * a 2×2 grid icon at its centre; as you scroll the icon fades and the card
 * SPLITS into the four stat cards, which fan out from the centre to their row
 * positions and reveal their value + label. The whole sequence plays out (and
 * then HOLDS, fully revealed) while the stage stays pinned on screen.
 */
function SplitStats() {
  const ref = useRef(null);
  // Tall scroll track; the stage inside is sticky-pinned to the viewport so the
  // entire split animation happens in view. Progress runs 0→1 across the track.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Soft spring = smooth + slow, independent of scroll speed.
  const p = useSpring(scrollYProgress, { stiffness: 32, damping: 30, mass: 1.3 });

  // The seed (icon) card: visible while the cards are stacked, fades as they split.
  const seedOpacity = useTransform(p, [0.1, 0.3], [1, 0]);
  const seedScale = useTransform(p, [0.1, 0.34], [1, 1.25]);
  const iconRotate = useTransform(p, [0, 0.34], [0, 35]);

  return (
    <div ref={ref} className="relative h-[200vh]">
      {/* Sticky stage — stays centred on screen for the whole animation. */}
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <div className="relative w-full">
          {/* The four stat cards (fan out from centre). */}
          <div className="flex justify-center gap-3 md:gap-6">
            {STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} index={i} p={p} />
            ))}
          </div>

          {/* Seed icon card — overlaid dead-centre, fades as the split begins. */}
          <motion.div
            style={{ opacity: seedOpacity, scale: seedScale }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <div className="grid h-[200px] w-[clamp(8rem,40vw,15rem)] place-items-center rounded-3xl border border-line/10 bg-bg-soft shadow-glass md:h-[260px]">
              <motion.svg
                style={{ rotate: iconRotate }}
                viewBox="0 0 24 24"
                fill="none"
                className="size-16 md:size-20 text-ink"
              >
                <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" opacity="0.9" />
                <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" opacity="0.55" />
                <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" opacity="0.55" />
                <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" opacity="0.9" />
              </motion.svg>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const STAT_VALUE_CLS =
  "font-display font-semibold text-ink tracking-[-0.03em] leading-none text-[clamp(1.6rem,4.5vw,3.25rem)]";

function StatCard({ stat, index, p }) {
  // Each card starts stacked at the centre (translated by -(i-1.5) widths) and
  // slides to its natural row slot (x → 0). A small per-card stagger makes the
  // split fan out rather than snap as one block.
  const t0 = 0.18 + index * 0.03;
  const collapsed = `${-(index - 1.5) * 112}%`;
  const x = useTransform(p, [t0, t0 + 0.34], [collapsed, "0%"]);
  const cardOpacity = useTransform(p, [t0, t0 + 0.12], [0, 1]);

  // Content reveals once the cards have spread apart, then holds.
  const c0 = 0.46 + index * 0.03;
  const contentOpacity = useTransform(p, [c0, c0 + 0.16], [0, 1]);
  const contentY = useTransform(p, [c0, c0 + 0.16], [18, 0]);

  return (
    <motion.div
      style={{ x, opacity: cardOpacity }}
      className="flex h-[200px] w-[clamp(5rem,20vw,15rem)] flex-col items-center justify-center gap-3 rounded-3xl border border-line/10 bg-bg-soft px-3 text-center shadow-glass md:h-[260px]"
    >
      <motion.div style={{ opacity: contentOpacity, y: contentY }} className={STAT_VALUE_CLS}>
        {stat.value}
      </motion.div>
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="font-mono text-[9px] md:text-xs uppercase tracking-[0.22em] text-ink-mute"
      >
        {stat.label}
      </motion.div>
    </motion.div>
  );
}
