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

        {/* Stats — each with a unique scroll-driven animation */}
        <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-14">
          {STATS.map((s, i) => (
            <StatItem key={s.label} value={s.value} label={s.label} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

const NUMBER_CLS =
  "font-display font-semibold text-ink tracking-[-0.03em] leading-none text-[clamp(2.5rem,7vw,5rem)]";

function StatItem({ value, label, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "start 42%"],
  });
  // Smooth, consistent regardless of scroll speed.
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 26, mass: 1 });

  const opacity = useTransform(p, [0, 0.55], [0, 1]);
  // 0 — clip wipe
  const clipPath = useTransform(p, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const x = useTransform(p, [0, 1], [-26, 0]);
  // 1 — flip up
  const rotateX = useTransform(p, [0, 1], [88, 0]);
  const y = useTransform(p, [0, 1], [44, 0]);
  // 2 — zoom + de-blur
  const scale = useTransform(p, [0, 1], [0.45, 1]);
  const blur = useTransform(p, [0, 1], ["blur(18px)", "blur(0px)"]);
  // 3 — masked rise + letter-spacing
  const innerY = useTransform(p, [0, 1], ["115%", "0%"]);
  const letterSpacing = useTransform(p, [0, 1], ["0.22em", "0em"]);

  let number;
  if (index === 0) {
    number = (
      <motion.div style={{ clipPath, x, opacity }} className={NUMBER_CLS}>
        {value}
      </motion.div>
    );
  } else if (index === 1) {
    number = (
      <motion.div
        style={{ rotateX, y, opacity, transformPerspective: 700, transformOrigin: "bottom" }}
        className={NUMBER_CLS}
      >
        {value}
      </motion.div>
    );
  } else if (index === 2) {
    number = (
      <motion.div style={{ scale, filter: blur, opacity }} className={NUMBER_CLS}>
        {value}
      </motion.div>
    );
  } else {
    number = (
      <span className="block overflow-hidden pb-[0.1em]">
        <motion.span
          style={{ y: innerY, letterSpacing, opacity }}
          className={`block ${NUMBER_CLS}`}
        >
          {value}
        </motion.span>
      </span>
    );
  }

  return (
    <div ref={ref} className="border-t border-line/12 pt-5">
      {number}
      <motion.div
        style={{ opacity }}
        className="mt-3 font-mono text-[10px] md:text-xs uppercase tracking-[0.22em] text-ink-mute"
      >
        {label}
      </motion.div>
    </div>
  );
}
