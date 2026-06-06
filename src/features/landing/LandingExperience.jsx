import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { Reveal } from "@/components/common/Reveal";
import { SectionBackdrop } from "@/components/common/SectionBackdrop";
import experienceData from "@/data/experience.json";
import { monthsBetween, formatMonths, formatPeriod, isCurrent } from "@/utils/duration";

const easing = [0.16, 1, 0.3, 1];

/**
 * Experience — the current job (and any past roles). Each card reveals with a
 * cinematic, scroll-driven choreography: a clip-wipe entrance, the logo zooms
 * + rotates in, the company name rises behind a mask, and the duration COUNTS
 * UP (driven by scroll progress) from 0 to its computed value. Duration is
 * derived from the joining date → now (or `end`).
 */
export function LandingExperience() {
  if (!experienceData.length) return null;

  return (
    <section id="experience" className="relative w-full py-24 md:py-36">
      <SectionBackdrop src="/profile4.png" position="left" opacity={0.2} />

      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <Reveal className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute mb-6">
          (01) — Experience
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-ink text-[clamp(2.5rem,8vw,6rem)]">
            Where I work
          </h2>
        </Reveal>

        <div className="mt-14 md:mt-20 space-y-6 md:space-y-8">
          {experienceData.map((item, i) => (
            <ExperienceCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({ item, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "start 45%"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 26, mass: 1 });

  // Card + element transforms (settle to identity = crisp at rest).
  const clipPath = useTransform(p, [0, 1], ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]);
  const opacity = useTransform(p, [0, 0.5], [0, 1]);
  const logoScale = useTransform(p, [0, 1], [0.55, 1]);
  const logoRotate = useTransform(p, [0, 1], [-12, 0]);
  const companyY = useTransform(p, [0, 1], ["110%", "0%"]);
  const roleX = useTransform(p, [0, 1], [-30, 0]);

  // Scroll-driven count-up of the duration (months).
  const totalMonths = monthsBetween(item.start, item.end);
  const [shownMonths, setShownMonths] = useState(0);
  const apply = (v) =>
    setShownMonths(Math.round(Math.min(1, Math.max(0, v)) * totalMonths));
  useMotionValueEvent(p, "change", apply);
  useEffect(() => {
    apply(p.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = isCurrent(item.end);

  return (
    <motion.article
      ref={ref}
      style={{ clipPath, opacity }}
      className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-8 overflow-hidden rounded-3xl border border-line/10 bg-bg-soft p-6 md:p-10"
    >
      {/* Logo */}
      <div className="md:col-span-2">
        <motion.div
          style={{ scale: logoScale, rotate: logoRotate }}
          className="grid size-16 md:size-20 place-items-center overflow-hidden rounded-2xl border border-line/10 bg-bg"
        >
          {item.logo ? (
            <img
              src={item.logo}
              alt={item.company}
              draggable={false}
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.2")}
            />
          ) : (
            <span className="font-display text-xl font-semibold text-ink">
              {item.company?.charAt(0)}
            </span>
          )}
        </motion.div>
      </div>

      {/* Company + role + period */}
      <div className="md:col-span-6 min-w-0">
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span
            style={{ y: companyY }}
            className="block font-display font-semibold tracking-[-0.02em] text-ink text-[clamp(1.6rem,4vw,2.75rem)] leading-tight"
          >
            {item.company}
          </motion.span>
        </span>

        {item.role && (
          <motion.p
            style={{ x: roleX, opacity }}
            className="mt-1.5 text-ink-dim text-base md:text-lg"
          >
            {item.role}
          </motion.p>
        )}

        <motion.div
          style={{ opacity }}
          className="mt-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute"
        >
          <span>{formatPeriod(item.start, item.end)}</span>
          {current && (
            <span className="inline-flex items-center gap-1.5 text-neon-lime">
              <span className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_8px_#a3e635] animate-pulse" />
              Current
            </span>
          )}
        </motion.div>
      </div>

      {/* Duration (count-up) */}
      <div className="md:col-span-4 md:text-right">
        <div className="font-display font-semibold tracking-[-0.03em] text-ink text-[clamp(2rem,5vw,3.5rem)] leading-none tabular-nums">
          {formatMonths(shownMonths)}
        </div>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-mute">
          {current ? "and counting" : "in role"}
        </div>
      </div>
    </motion.article>
  );
}
