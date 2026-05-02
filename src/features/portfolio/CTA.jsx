import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NeonText } from "@/components/ui/NeonText";

/**
 * CTA / "04 · Talk to me" — cinematic scroll choreography.
 *
 *   Section is pinned for ~180svh on desktop. As the user scrolls through
 *   it the four pieces — eyebrow, heading, subtitle, button — each reveal
 *   in their own scroll band with a clean enter / hold / exit cycle that
 *   mirrors the Hero. The conic gradient behind the card slowly rotates
 *   AND scales with scroll, and the card itself responds to the cursor
 *   with a subtle 3D tilt.
 *
 *   Mobile / prefers-reduced-motion both bypass the pinned stage entirely
 *   and render a static `<CTAStatic />` so the section feels crisp on
 *   phones (no continuous scroll-driven motion values, no perspective).
 */

const easeIO = cubicBezier(0.65, 0, 0.35, 1);

export function CTA() {
  const sectionRef = useRef(null);
  const prefersReduced = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 38,
    mass: 0.35,
  });

  // Mouse parallax for the card tilt.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const onMouseMove = (e) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };
  const onMouseLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // The four sub-elements (eyebrow / heading / subtitle / button) all
  // share a wide rest plateau from ~0.34 → ~0.76 of progress so the card
  // reads as fully solid for most of the scroll, instead of only at the
  // narrow midpoint. Each still has a slightly staggered entry so the
  // composition assembles nicely on the way in.

  // === Eyebrow — first to enter, last to leave =========================
  const eyebrowY = useTransform(
    p,
    [0, 0.22, 0.80, 1],
    ["20vh", "0vh", "0vh", "-20vh"],
    { ease: easeIO },
  );
  const eyebrowOpacity = useTransform(p, [0.02, 0.18, 0.84, 0.98], [0, 1, 1, 0]);

  // === Heading =========================================================
  const headingY = useTransform(
    p,
    [0, 0.26, 0.78, 1],
    ["22vh", "0vh", "0vh", "-22vh"],
    { ease: easeIO },
  );
  const headingOpacity = useTransform(p, [0.04, 0.22, 0.80, 0.96], [0, 1, 1, 0]);
  const headingBlur = useTransform(
    p,
    [0, 0.22, 0.80, 1],
    ["blur(14px)", "blur(0px)", "blur(0px)", "blur(10px)"],
  );

  // === Subtitle ========================================================
  const subtitleY = useTransform(
    p,
    [0.10, 0.30, 0.78, 0.96],
    ["10vh", "0vh", "0vh", "-12vh"],
    { ease: easeIO },
  );
  const subtitleOpacity = useTransform(
    p,
    [0.10, 0.28, 0.78, 0.94],
    [0, 1, 1, 0],
  );

  // === Button — last to settle, scales in with a subtle pop ============
  const buttonY = useTransform(
    p,
    [0.16, 0.34, 0.76, 0.94],
    ["8vh", "0vh", "0vh", "-8vh"],
    { ease: easeIO },
  );
  const buttonOpacity = useTransform(p, [0.16, 0.34, 0.76, 0.94], [0, 1, 1, 0]);
  const buttonScale = useTransform(
    p,
    [0.16, 0.34, 0.76, 0.94],
    [0.85, 1, 1, 0.92],
    { ease: easeIO },
  );

  // === Background conic — rotates with scroll on top of its CSS spin ====
  const bgScale = useTransform(p, [0, 1], [1.0, 1.18]);
  const bgRotate = useTransform(p, [0, 1], [0, 240]);
  const bgOpacity = useTransform(p, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);

  // === Card mouse tilt ==================================================
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), {
    stiffness: 80,
    damping: 20,
  });
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 80,
    damping: 20,
  });

  // Mobile + reduced-motion fall back to a static layout — pinned scroll
  // choreography is the source of iOS fuzzy-text rendering on cards.
  if (isMobile || prefersReduced) return <CTAStatic />;

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative h-[160svh] md:h-[180svh]"
      style={{ perspective: 1600 }}
    >
      <div
        className="sticky top-0 h-[100svh] overflow-hidden flex items-center"
        style={{ willChange: "transform", contain: "paint" }}
      >
        {/* === Conic gradient — scroll-driven scale + rotate, plus a slow
             continuous CSS spin so it's never fully static. Opacity kept
             low so the card text on top stays high-contrast. === */}
        <motion.div
          aria-hidden
          style={{ scale: bgScale, rotate: bgRotate, opacity: bgOpacity }}
          className="absolute -inset-40 -z-20 opacity-20 bg-[conic-gradient(from_0deg,#22d3ee,#8b5cf6,#f472b6,#22d3ee)] blur-3xl animate-[spin_22s_linear_infinite]"
        />

        {/* === Grid backdrop === */}
        <div className="absolute inset-0 -z-10 grid-bg opacity-25" />

        {/* === Vignette to keep the card readable === */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 50%, rgba(5,6,10,0.0) 0%, rgba(5,6,10,0.55) 60%, rgba(5,6,10,0.88) 100%)",
          }}
        />

        {/* === Drifting accent particles === */}
        <ParticleField />

        {/* === Card with mouse-tilt outer wrapper === */}
        <motion.div
          style={{
            rotateX: tiltX,
            rotateY: tiltY,
            transformStyle: "preserve-3d",
            transformPerspective: 1400,
          }}
          className="relative mx-auto max-w-5xl w-full px-6"
        >
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 shadow-glass bg-bg-panel/90 backdrop-blur-2xl p-10 md:p-16 text-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Inner halo — slowly rotating, anchored to the card. Pushed
                behind the card body via -z-10 + lower opacity so it's an
                ambient glow rather than competing with the heading. */}
            <motion.div
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-32 -z-10 opacity-15 bg-[conic-gradient(from_0deg,#22d3ee,#8b5cf6,#f472b6,#22d3ee)] blur-3xl pointer-events-none"
            />

            {/* Top corner brackets */}
            <span className="absolute top-3 left-3 w-6 h-6 border-l border-t border-neon-cyan/60" />
            <span className="absolute top-3 right-3 w-6 h-6 border-r border-t border-neon-cyan/60" />
            <span className="absolute bottom-3 left-3 w-6 h-6 border-l border-b border-neon-cyan/60" />
            <span className="absolute bottom-3 right-3 w-6 h-6 border-r border-b border-neon-cyan/60" />

            <motion.div
              style={{ y: eyebrowY, opacity: eyebrowOpacity }}
              className="relative font-mono text-xs tracking-[0.45em] text-neon-cyan uppercase flex items-center justify-center gap-2"
            >
              <span className="block w-6 h-px bg-neon-cyan/70" />
              04 · Talk to me
              <span className="block w-6 h-px bg-neon-cyan/70" />
            </motion.div>

            <motion.h2
              style={{
                y: headingY,
                opacity: headingOpacity,
                filter: headingBlur,
              }}
              className="relative mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]"
            >
              Don't read a CV. <br />
              <NeonText>Have a conversation.</NeonText>
            </motion.h2>

            <motion.p
              style={{ y: subtitleY, opacity: subtitleOpacity }}
              className="relative mt-6 text-ink-dim max-w-xl mx-auto"
            >
              Athion AI knows my stack, projects, and story. Ask anything —
              even technical questions — and get a real answer.
            </motion.p>

            <motion.div
              style={{ y: buttonY, opacity: buttonOpacity, scale: buttonScale }}
              className="relative mt-8 flex justify-center"
            >
              <Button as={Link} to="/chat" size="lg">
                <Sparkles className="size-4" />
                Open the chat
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
 * CTAStatic — mobile / reduced-motion path. Uses whileInView entry only,
 * no scroll-driven motion values, no perspective, no will-change — so the
 * card's text rasterizes crisply on iOS Safari.
 * ========================================================================= */
function CTAStatic() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-5xl px-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: easeIO }}
          className="relative overflow-hidden rounded-3xl border border-white/10 shadow-glass bg-bg-panel p-8 sm:p-12 text-center"
        >
          <div className="absolute inset-0 -z-10 bg-grid-fade" />
          <div className="absolute -inset-20 -z-10 opacity-25 bg-[conic-gradient(from_0deg,#22d3ee,#8b5cf6,#f472b6,#22d3ee)] blur-3xl animate-[spin_22s_linear_infinite]" />

          <span className="absolute top-3 left-3 w-5 h-5 border-l border-t border-neon-cyan/60" />
          <span className="absolute top-3 right-3 w-5 h-5 border-r border-t border-neon-cyan/60" />
          <span className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-neon-cyan/60" />
          <span className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-neon-cyan/60" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeIO }}
            className="font-mono text-[10px] sm:text-xs tracking-[0.4em] text-neon-cyan uppercase flex items-center justify-center gap-2"
          >
            <span className="block w-5 h-px bg-neon-cyan/70" />
            04 · Talk to me
            <span className="block w-5 h-px bg-neon-cyan/70" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easeIO }}
            className="mt-3 font-display text-2xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
          >
            Don't read a CV. <br />
            <NeonText>Have a conversation.</NeonText>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.35, ease: easeIO }}
            className="mt-4 text-ink-dim text-sm sm:text-base max-w-xl mx-auto"
          >
            Athion AI knows my stack, projects, and story. Ask anything —
            even technical questions — and get a real answer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.5, ease: easeIO }}
            className="mt-6 flex justify-center"
          >
            <Button as={Link} to="/chat" size="lg">
              <Sparkles className="size-4" />
              Open the chat
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
 * ParticleField — drifting accent dots behind the card (desktop only).
 * ========================================================================= */
function ParticleField() {
  const dots = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: (i * 53 + 7) % 100,
    top: (i * 31 + 11) % 100,
    delay: (i % 6) * 0.5,
    dur: 7 + (i % 5),
    size: 1 + ((i * 7) % 3),
  }));
  return (
    <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-neon-cyan/60"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            boxShadow: "0 0 6px rgba(34,211,238,0.65)",
          }}
          animate={{ opacity: [0.1, 0.6, 0.1], y: [-8, 8, -8] }}
          transition={{
            duration: d.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: d.delay,
          }}
        />
      ))}
    </div>
  );
}
