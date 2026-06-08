import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
} from "framer-motion";
import { Reveal } from "@/components/common/Reveal";
import { SectionBackdrop } from "@/components/common/SectionBackdrop";
import experienceData from "@/data/experience.json";
import { monthsBetween, formatMonths, formatPeriod, isCurrent } from "@/utils/duration";

/**
 * Experience — the current job (and any past roles). Each card animates on
 * scroll as a small story: it starts as TWO round badges (the company logo,
 * and the company name). As you scroll they FLIP like coins, slide toward each
 * other and MERGE; from that seam a landscape card grows outward (round → wide)
 * and all the detail (role, period, duration count-up) reveals into place.
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

        <div className="mt-14 md:mt-20 space-y-10 md:space-y-12">
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
  // One scroll window drives the whole story. Anchored so it only kicks off
  // once the card is fully on screen, with enough travel for a multi-stage play.
  // The outer ref is a tall scroll "track"; the card inside is sticky-pinned to
  // the viewport. Progress runs 0→1 across the track, so the entire animation
  // plays out while the card stays centred on screen — it never scrolls away.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 32, damping: 30, mass: 1.3 });

  // The whole story is compressed into the first ~60% of the scroll track; the
  // remaining 0.6→1 is a HOLD where the finished card simply stays pinned and
  // fully revealed before it finally releases. (Keyframes below all land ≤0.6.)
  const HOLD = 0.6;

  // ── Stage 1–2: the two round badges flip + slide together and merge ──
  const logoX = useTransform(p, [0, 0.3], ["-130%", "0%"]); // left → centre
  const nameX = useTransform(p, [0, 0.3], ["130%", "0%"]); // right → centre
  const badgeFlip = useTransform(p, [0, 0.3], [0, 180]); // coin flip
  const badgeOpacity = useTransform(p, [0.24, 0.34], [1, 0]); // fade as they fuse
  const badgeRadius = useTransform(p, [0, 0.3], [50, 24]); // round → squared
  const badgeBorderRadius = useMotionTemplate`${badgeRadius}%`;

  // ── Stage 3: the landscape card grows from the seam (round → wide) ──
  const cardClip = useTransform(
    p,
    [0.28, 0.5],
    ["inset(34% 50% 34% 50% round 999px)", "inset(0% 0% 0% 0% round 44px)"],
  );
  const cardOpacity = useTransform(p, [0.28, 0.36], [0, 1]);

  // ── Stage 3b: detail reveals once the card has opened up ──
  const contentOpacity = useTransform(p, [0.46, 0.6], [0, 1]);
  const contentY = useTransform(p, [0.46, 0.6], [22, 0]);

  // Scroll-driven count-up of the duration (months) — finishes with the reveal,
  // then holds at its final value through the rest of the pinned track.
  const totalMonths = monthsBetween(item.start, item.end);
  const [shownMonths, setShownMonths] = useState(0);
  const apply = (v) =>
    setShownMonths(Math.round(Math.min(1, Math.max(0, v / HOLD)) * totalMonths));
  useMotionValueEvent(p, "change", apply);
  useEffect(() => {
    apply(p.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = isCurrent(item.end);

  return (
    <div ref={ref} className="relative h-[220vh]">
      {/* Sticky-pinned stage: stays centred on screen while progress scrubs. */}
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <div className="relative h-[340px] md:h-[400px] w-full [perspective:1600px]">
          {/* ── The landscape card that the badges merge into ──────────── */}
          <motion.div
            style={{ clipPath: cardClip, opacity: cardOpacity }}
            className="absolute inset-0 overflow-hidden rounded-[44px] border border-line/10 bg-bg-soft"
          >
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="grid h-full grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-8 p-8 md:p-10"
        >
          {/* Logo */}
          <div className="md:col-span-2">
            <div className="grid size-16 md:size-20 place-items-center overflow-hidden rounded-2xl border border-line/10 bg-bg">
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
            </div>
          </div>

          {/* Company + role + period */}
          <div className="md:col-span-6 min-w-0">
            <h3 className="block font-display font-semibold tracking-[-0.02em] text-ink text-[clamp(1.5rem,4vw,2.5rem)] leading-tight">
              {item.company}
            </h3>

            {item.role && (
              <p className="mt-1.5 text-ink-dim text-base md:text-lg">
                {item.role}
              </p>
            )}

            <div className="mt-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute">
              <span>{formatPeriod(item.start, item.end)}</span>
              {current && (
                <span className="inline-flex items-center gap-1.5 text-neon-lime">
                  <span className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_8px_#a3e635] animate-pulse" />
                  Current
                </span>
              )}
            </div>
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
        </motion.div>
      </motion.div>

      {/* ── The two round badges (sit above the card, fade as they merge) ─ */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
        {/* Logo badge */}
        <motion.div
          style={{
            x: logoX,
            rotateY: badgeFlip,
            opacity: badgeOpacity,
            borderRadius: badgeBorderRadius,
          }}
          className="absolute grid size-40 md:size-48 place-items-center overflow-hidden border border-line/10 bg-bg-soft shadow-glass"
        >
          <div className="size-28 md:size-36 overflow-hidden rounded-full border border-line/10 bg-bg">
            {item.logo ? (
              <img
                src={item.logo}
                alt={item.company}
                draggable={false}
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.style.opacity = "0.2")}
              />
            ) : (
              <span className="grid h-full w-full place-items-center font-display text-3xl font-semibold text-ink">
                {item.company?.charAt(0)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Company-name badge */}
        <motion.div
          style={{
            x: nameX,
            rotateY: badgeFlip,
            opacity: badgeOpacity,
            borderRadius: badgeBorderRadius,
          }}
          className="absolute grid size-40 md:size-48 place-items-center overflow-hidden border border-line/10 bg-ink text-center"
        >
          <span className="px-4 font-display font-semibold leading-tight tracking-[-0.02em] text-bg text-[clamp(1rem,3vw,1.5rem)]">
            {item.company}
          </span>
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
