import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Typewriter } from "@/components/common/Typewriter";
import { DataFlow } from "@/components/common/DataFlow";
import { useBootStore } from "@/store";

/**
 * Cinematic hero — split-stage choreography.
 *
 *   Initial frame:
 *     • Profile portrait sits dead-center, large.
 *     • Name "ATHUL P" rests just below the portrait — huge, outlined, with
 *       a pulsing dual-color drop-shadow + animated dashed underline.
 *
 *   On scroll:
 *     • Image translates LEFT (-26vw), rotates +20° Y, scales 0.85.
 *     • Name translates RIGHT (+22vw), rises slightly, scales 0.65 — settles
 *       on the opposite side of the stage like a vertical identity plate.
 *     • Content (typewriter, subtitle, CTAs) reveals in the now-empty centre.
 *
 *   Implementation:
 *     • Section is 220svh tall; the inner sticky stage is pinned through scroll.
 *     • Each animated element has TWO motion wrappers — outer for the entry
 *       sequence (post-loader), inner for scroll-driven transforms — so
 *       `style` and `animate` never collide on the same prop.
 *     • Entry sequence is gated on `useBootStore.ready`, so animations only
 *       fire once the IdentityLoader has dissolved.
 */

const easing = [0.16, 1, 0.3, 1];

export function Hero() {
  const heroRef = useRef(null);
  const ready = useBootStore((s) => s.ready);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  // Lenis smooths the scroll position globally (App.jsx). On top of that we
  // run a *light* spring so transforms glide silkily between Lenis ticks —
  // high stiffness keeps it responsive (no "stuck" feel), low mass keeps
  // it from overshooting. Don't crank stiffness below ~150 or it'll lag.
  const p = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 40,
    mass: 0.35,
  });

  // Viewport gate: on mobile (< md) we drop the horizontal split because a
  // -26vw / +22vw shift on a 360–414px screen pushes the image and name off
  // canvas and into each other. Mobile gets a clean fade + scale instead.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // === Image scroll choreography ========================================
  // Desktop: centre → left + tilt. Mobile: stay centred, fade + scale down.
  const imgX_d = useTransform(p, [0, 0.65], ["0vw", "-26vw"]);
  const imgX_m = useTransform(p, [0, 1], ["0vw", "0vw"]);
  const imgY_d = useTransform(p, [0, 0.65], ["0vh", "-2vh"]);
  const imgY_m = useTransform(p, [0, 0.5], ["0vh", "-6vh"]);
  const imgRotateY_d = useTransform(p, [0, 0.65], [0, 20]);
  const imgRotateY_m = useTransform(p, [0, 1], [0, 0]);
  const imgScale_d = useTransform(p, [0, 0.65], [1, 0.85]);
  const imgScale_m = useTransform(p, [0, 0.5], [1, 0.7]);
  const imgOpacity_d = useTransform(p, [0.85, 1], [1, 0.55]);
  const imgOpacity_m = useTransform(p, [0.2, 0.5], [1, 0]);

  const imgX = isMobile ? imgX_m : imgX_d;
  const imgY = isMobile ? imgY_m : imgY_d;
  const imgRotateY = isMobile ? imgRotateY_m : imgRotateY_d;
  const imgScale = isMobile ? imgScale_m : imgScale_d;
  const imgOpacity = isMobile ? imgOpacity_m : imgOpacity_d;

  // === Name scroll choreography =========================================
  // Desktop: under image → right side. Mobile: stays centred, fades up.
  const nameX_d = useTransform(p, [0, 0.65], ["0vw", "22vw"]);
  const nameX_m = useTransform(p, [0, 1], ["0vw", "0vw"]);
  const nameY_d = useTransform(p, [0, 0.65], ["0vh", "-6vh"]);
  const nameY_m = useTransform(p, [0, 0.5], ["0vh", "-10vh"]);
  const nameScale_d = useTransform(p, [0, 0.65], [1, 0.65]);
  const nameScale_m = useTransform(p, [0, 0.5], [1, 0.55]);
  const nameLetter_d = useTransform(p, [0, 0.65], ["-0.02em", "0.06em"]);
  const nameLetter_m = useTransform(p, [0, 0.5], ["-0.02em", "0.04em"]);
  const nameOpacity_d = useTransform(p, [0, 1], [1, 1]);
  const nameOpacity_m = useTransform(p, [0.2, 0.5], [1, 0]);

  const nameX = isMobile ? nameX_m : nameX_d;
  const nameY = isMobile ? nameY_m : nameY_d;
  const nameScale = isMobile ? nameScale_m : nameScale_d;
  const nameLetter = isMobile ? nameLetter_m : nameLetter_d;
  const nameOpacity = isMobile ? nameOpacity_m : nameOpacity_d;

  // === Background parallax (slowest) =====================================
  const bgY = useTransform(p, [0, 1], ["0%", "-6%"]);
  const bgScale = useTransform(p, [0, 1], [1.04, 1.0]);

  // === Content layer (fastest) ===========================================
  // Mobile reveals earlier so the empty stage isn't held too long after the
  // image/name fade out.
  const contentY_d = useTransform(p, [0.35, 1], ["10%", "-2%"]);
  const contentY_m = useTransform(p, [0.25, 0.7], ["12%", "0%"]);
  const contentOpacity_d = useTransform(p, [0.35, 0.55], [0, 1]);
  const contentOpacity_m = useTransform(p, [0.25, 0.45], [0, 1]);

  const contentY = isMobile ? contentY_m : contentY_d;
  const contentOpacity = isMobile ? contentOpacity_m : contentOpacity_d;

  // === Cursor parallax for image (subtle) ================================
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 80, damping: 18, mass: 0.6 });
  const tiltX = useTransform(sy, [-1, 1], [5, -5]);
  const tiltY = useTransform(sx, [-1, 1], [-8, 8]);
  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  // === Reveal flag for content ===========================================
  const [revealed, setRevealed] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    const threshold = isMobile ? 0.32 : 0.42;
    if (v > threshold && !revealed) setRevealed(true);
  });

  // Honour reduced-motion: bail out of the pinned scroll choreography.
  if (prefersReduced) {
    // (visual fallback handled below via shorter section + no transforms)
  }

  // Hide scroll cue immediately on scroll start
  const cueOpacity = useTransform(p, [0, 0.04], [1, 0]);

  // Entry sequence gating
  const [entered, setEntered] = useState(ready);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <section
      ref={heroRef}
      id="hero"
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      className={
        prefersReduced
          ? "relative h-[100svh]"
          : "relative h-[130svh] md:h-[170svh]"
      }
      style={{ perspective: 1600 }}
    >
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        style={{ willChange: "transform", contain: "paint" }}
      >
        {/* === Background ============================================== */}
        <motion.div
          style={{ y: bgY, scale: bgScale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ duration: 1.2, ease: easing }}
          className="absolute inset-0 -z-30"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 600px at 50% 30%, rgba(139,92,246,0.22), transparent 70%), radial-gradient(700px 500px at 50% 90%, rgba(34,211,238,0.18), transparent 70%)",
            }}
          />
        </motion.div>
        <motion.div
          style={{ y: bgY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 0.4 : 0 }}
          transition={{ duration: 1.2, ease: easing, delay: 0.2 }}
          className="absolute inset-0 -z-20 grid-bg"
        />
        <motion.div
          style={{ y: bgY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 0.55 : 0 }}
          transition={{ duration: 1.4, ease: easing, delay: 0.4 }}
          className="absolute inset-0 -z-20"
        >
          <DataFlow className="w-full h-full" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-noise opacity-[0.06] mix-blend-overlay" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-bg to-transparent" />

        {/* === Centre stack: image + name underneath ==================== */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="relative flex flex-col items-center justify-center gap-3 sm:gap-6 md:gap-8">
            {/* Image ----------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 40, filter: "blur(14px)" }}
              animate={{
                opacity: entered ? 1 : 0,
                scale: entered ? 1 : 0.86,
                y: entered ? 0 : 40,
                filter: entered ? "blur(0px)" : "blur(14px)",
              }}
              transition={{ duration: 1.1, ease: easing, delay: 0.25 }}
            >
              <motion.div
                style={{
                  x: imgX,
                  y: imgY,
                  rotateY: imgRotateY,
                  scale: imgScale,
                  opacity: imgOpacity,
                  transformStyle: "preserve-3d",
                }}
              >
                <motion.div
                  style={{
                    rotateX: tiltX,
                    rotateY: tiltY,
                    transformStyle: "preserve-3d",
                  }}
                  className="relative"
                >
                  <ProfilePortrait />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Name (under image) -------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(16px)" }}
              animate={{
                opacity: entered ? 1 : 0,
                y: entered ? 0 : 30,
                filter: entered ? "blur(0px)" : "blur(16px)",
              }}
              transition={{ duration: 1.0, ease: easing, delay: 0.55 }}
              className="pointer-events-none"
            >
              <motion.div
                style={{
                  x: nameX,
                  y: nameY,
                  scale: nameScale,
                  letterSpacing: nameLetter,
                  opacity: nameOpacity,
                }}
                className="relative"
              >
                <AestheticName text="Athul P" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* === Content layer (revealed on scroll) ======================= */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="absolute inset-0 z-10"
        >
          <div className="mx-auto h-full max-w-7xl px-6 grid md:grid-cols-12 items-center">
            <div className="md:col-span-6 md:col-start-4 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.6, ease: easing }}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 glass text-xs font-mono text-ink-dim tracking-widest uppercase"
              >
                <span className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_10px_#a3e635] animate-pulse" />
                ATHION AI · IDENTITY ONLINE
              </motion.div>

              <h2 className="font-display font-semibold tracking-tight leading-[1] text-3xl md:text-5xl">
                <span className="block text-ink-dim text-xs md:text-sm font-mono tracking-[0.35em] uppercase mb-3">
                  {revealed ? (
                    <Typewriter text="// dossier loaded" speed={32} cursor={false} />
                  ) : (
                    " "
                  )}
                </span>
                <span className="block">
                  {revealed ? (
                    <Typewriter
                      text="Full-stack engineer · AI builder."
                      speed={28}
                      delay={500}
                    />
                  ) : (
                    " "
                  )}
                </span>
              </h2>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                transition={{ duration: 0.7, ease: easing, delay: 1.6 }}
                className="mt-6 max-w-xl mx-auto md:mx-0 text-ink-dim text-base md:text-lg leading-relaxed"
              >
                I design, ship, and obsess over interfaces — and the AI systems
                behind them. Don't read a CV. Have a conversation with the
                system that knows my work.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                transition={{ duration: 0.7, ease: easing, delay: 1.9 }}
                className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
              >
                <Button as={Link} to="/chat" size="lg">
                  <Sparkles className="size-4" />
                  Talk with my AI
                  <ArrowRight className="size-4" />
                </Button>
                <Button as="a" href="#projects" variant="outline" size="lg">
                  Browse the work
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 2.3 }}
                className="mt-10 grid grid-cols-3 max-w-md gap-4 mx-auto md:mx-0 text-[10px] font-mono uppercase tracking-[0.25em] text-ink-mute"
              >
                <Readout k="lat" v="42ms" />
                <Readout k="ctx" v="loaded" />
                <Readout k="sys" v="nominal" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity: cueOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-mute pointer-events-none"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">
            scroll to reveal
          </span>
          <ChevronDown className="size-4 animate-float" />
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
 * AestheticName — outlined typography with pulsing dual-shadow,
 * shimmering gradient ghost behind it, and an animated dashed underline.
 * ========================================================================= */
// One source of truth for the name font — swap this string to try another:
//   "'Playfair Display', serif"     ← elegant editorial italic (current)
//   "'DM Serif Display', serif"     ← bold high-contrast italic
//   "'Cormorant Garamond', serif"   ← refined classical italic
//   "'Space Grotesk', sans-serif"   ← clean modern italic sans
//   "Audiowide, sans-serif"         ← retro-future tech (no real italic)
const NAME_FONT =
  "'Playfair Display', 'DM Serif Display', 'Cormorant Garamond', serif";

// Aesthetic radial palettes — black core/edge + accent color bloom.
// Each `fill` is a RADIAL gradient: a vibrant accent at the centre fades
// outward to black, so the letters read like glowing embers on the dark
// stage. `ghost` is the blurred halo behind. `glow` pulses the textShadow.
const PALETTES = {
  // Mono — pure white centre, black edges. Minimal & timeless. (default)
  mono: {
    fill: "radial-gradient(ellipse at 50% 50%, #ffffff 0%, #d1d5db 25%, #4b5563 55%, #0a0a0a 80%, #000 100%)",
    ghost: "radial-gradient(ellipse at 50% 50%, #ffffff, #9ca3af, transparent 70%)",
    glow: [
      "0 0 26px rgba(255,255,255,0.35), 0 0 70px rgba(255,255,255,0.15)",
      "0 0 36px rgba(255,255,255,0.45), 0 0 90px rgba(255,255,255,0.20)",
      "0 0 26px rgba(255,255,255,0.35), 0 0 70px rgba(255,255,255,0.15)",
    ],
    stroke: "rgba(255,255,255,0.25)",
  },
  // Ember — hot rose centre, black edges. Bold & cinematic.
  ember: {
    fill: "radial-gradient(ellipse at 50% 50%, #ff3d8b 0%, #c1185a 25%, #2a0716 60%, #000000 100%)",
    ghost: "radial-gradient(ellipse at 50% 50%, #ff3d8b, #c1185a, transparent 70%)",
    glow: [
      "0 0 28px rgba(255,61,139,0.55), 0 0 70px rgba(255,61,139,0.25)",
      "0 0 36px rgba(244,114,182,0.65), 0 0 90px rgba(192,38,90,0.30)",
      "0 0 28px rgba(255,61,139,0.55), 0 0 70px rgba(255,61,139,0.25)",
    ],
    stroke: "rgba(255,61,139,0.30)",
  },
  // Solar — golden amber centre, black edges. Warm & luxe.
  solar: {
    fill: "radial-gradient(ellipse at 50% 50%, #fbbf24 0%, #d97706 30%, #2a1604 65%, #000 100%)",
    ghost: "radial-gradient(ellipse at 50% 50%, #fbbf24, #f59e0b, transparent 70%)",
    glow: [
      "0 0 28px rgba(251,191,36,0.55), 0 0 70px rgba(217,119,6,0.30)",
      "0 0 38px rgba(253,224,71,0.65), 0 0 90px rgba(251,113,133,0.25)",
      "0 0 28px rgba(251,191,36,0.55), 0 0 70px rgba(217,119,6,0.30)",
    ],
    stroke: "rgba(253,224,71,0.30)",
  },
  // Plasma — electric violet centre, black edges. Cyberpunk vibe.
  plasma: {
    fill: "radial-gradient(ellipse at 50% 50%, #c084fc 0%, #7c3aed 30%, #1a0633 65%, #000 100%)",
    ghost: "radial-gradient(ellipse at 50% 50%, #c084fc, #8b5cf6, transparent 70%)",
    glow: [
      "0 0 28px rgba(192,132,252,0.55), 0 0 70px rgba(124,58,237,0.30)",
      "0 0 38px rgba(217,70,239,0.65), 0 0 90px rgba(139,92,246,0.30)",
      "0 0 28px rgba(192,132,252,0.55), 0 0 70px rgba(124,58,237,0.30)",
    ],
    stroke: "rgba(192,132,252,0.32)",
  },
  // Toxic — neon green centre, black edges. Sharp, futuristic.
  toxic: {
    fill: "radial-gradient(ellipse at 50% 50%, #a3e635 0%, #4d7c0f 30%, #0a1604 65%, #000 100%)",
    ghost: "radial-gradient(ellipse at 50% 50%, #a3e635, #65a30d, transparent 70%)",
    glow: [
      "0 0 28px rgba(163,230,53,0.55), 0 0 70px rgba(77,124,15,0.30)",
      "0 0 38px rgba(190,242,100,0.65), 0 0 90px rgba(101,163,13,0.30)",
      "0 0 28px rgba(163,230,53,0.55), 0 0 70px rgba(77,124,15,0.30)",
    ],
    stroke: "rgba(190,242,100,0.30)",
  },
  // Glacier — icy cyan centre, black edges. Cool & arctic.
  glacier: {
    fill: "radial-gradient(ellipse at 50% 50%, #67e8f9 0%, #0891b2 30%, #042029 65%, #000 100%)",
    ghost: "radial-gradient(ellipse at 50% 50%, #67e8f9, #0891b2, transparent 70%)",
    glow: [
      "0 0 28px rgba(103,232,249,0.55), 0 0 70px rgba(8,145,178,0.30)",
      "0 0 38px rgba(165,243,252,0.65), 0 0 90px rgba(34,211,238,0.30)",
      "0 0 28px rgba(103,232,249,0.55), 0 0 70px rgba(8,145,178,0.30)",
    ],
    stroke: "rgba(165,243,252,0.30)",
  },
};
const NAME_PALETTE = PALETTES.mono;

function AestheticName({ text }) {
  const baseFontStyle = {
    fontFamily: NAME_FONT,
    fontSize: "clamp(2.1rem, 9vw, 9.5rem)",
    lineHeight: 1.0,
    letterSpacing: "-0.01em",
    fontWeight: 700,
    fontStyle: "italic",
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        {/* Soft gradient halo behind (ghost) */}
        <motion.span
          aria-hidden
          className="absolute inset-0 select-none whitespace-nowrap"
          style={{
            ...baseFontStyle,
            backgroundImage: NAME_PALETTE.ghost,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "blur(18px)",
            opacity: 0.6,
          }}
          animate={{ opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.span>

        {/* Main text — radial bloom (centre accent → black edges) with pulsing glow */}
        <motion.span
          className="relative select-none whitespace-nowrap"
          style={{
            ...baseFontStyle,
            backgroundImage: NAME_PALETTE.fill,
            backgroundSize: "140% 180%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextStroke: `0.6px ${NAME_PALETTE.stroke}`,
          }}
          animate={{
            backgroundSize: ["140% 180%", "170% 210%", "140% 180%"],
            textShadow: NAME_PALETTE.glow,
          }}
          transition={{
            backgroundSize: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            textShadow: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {text}
        </motion.span>

        {/* Shimmer line that sweeps across the name */}
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-1/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(34,211,238,0.45), transparent)",
            mixBlendMode: "screen",
            filter: "blur(6px)",
          }}
          initial={{ x: "-120%" }}
          animate={{ x: ["-120%", "320%"] }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1.4,
          }}
        />
      </div>

      {/* Animated dashed underline + side ticks (the "dash" decoration) */}
      <svg
        aria-hidden
        viewBox="0 0 600 30"
        preserveAspectRatio="none"
        className="mt-2 sm:mt-3 w-[min(72vw,820px)] h-[14px] sm:h-[18px] pointer-events-none"
      >
        <defs>
          <linearGradient id="aname-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* base dashed line */}
        <line
          x1="20"
          y1="15"
          x2="580"
          y2="15"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
          strokeDasharray="8 6"
        />
        {/* moving cyan/violet dash overlay */}
        <motion.line
          x1="20"
          y1="15"
          x2="580"
          y2="15"
          stroke="url(#aname-line)"
          strokeWidth="1.6"
          strokeDasharray="14 8"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -440 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        {/* end caps */}
        <circle cx="20" cy="15" r="2.5" fill="#22d3ee" />
        <circle cx="580" cy="15" r="2.5" fill="#8b5cf6" />
      </svg>

      {/* tiny mono caption beneath */}
      <div className="mt-2 font-mono text-[10px] tracking-[0.45em] uppercase text-ink-mute">
        full-stack · ai · interface
      </div>
    </div>
  );
}

/* =========================================================================
 * ProfilePortrait — AI Model Viewer panel.
 *
 * The transparent PNG is the "subject" the AI model is rendering. The panel
 * around it shows live model chrome — status bar, side telemetry, frame
 * counter, processing bar, locking reticle, scan sweep, network nodes —
 * all animated to feel like an active inference visualisation.
 *
 * Drop your file at `public/profile1.png` (or change `src` below).
 * ========================================================================= */
function ProfilePortrait() {
  return (
    <motion.div
      className="relative"
      style={{
        width: "min(78vw, 480px)",
        height: "clamp(340px, 58svh, 660px)",
      }}
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      {/* Outer halo glow behind the whole panel */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 rounded-full pointer-events-none"
        style={{
          width: "min(110vw, 780px)",
          height: "min(110vw, 780px)",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(139,92,246,0.40) 0%, rgba(34,211,238,0.16) 45%, transparent 72%)",
          filter: "blur(48px)",
        }}
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* === The viewer panel ====================================== */}
      <div className="relative w-full h-full rounded-[28px] overflow-hidden">
        {/* Rotating conic gradient border ring */}
        <motion.div
          aria-hidden
          className="absolute -inset-1/2 -z-10"
          style={{
            background:
              "conic-gradient(from 0deg, #22d3ee, #8b5cf6, #ec4899, #22d3ee, #8b5cf6, #22d3ee)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        {/* Glass mask interior */}
        <div
          className="absolute inset-[1.5px] rounded-[26px]"
          style={{
            background: "rgba(8, 10, 18, 0.82)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        />
        {/* Grid pattern */}
        <div
          aria-hidden
          className="absolute inset-[1.5px] rounded-[26px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
            opacity: 0.45,
          }}
        />
        {/* Pulsing inner radial */}
        <motion.div
          aria-hidden
          className="absolute inset-[1.5px] rounded-[26px]"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 60%, rgba(139,92,246,0.22) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* === Subject (the figure) =============================== */}
        <motion.div
          className="absolute inset-0 flex items-end justify-center pb-10"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.img
            src="/profile2.jpeg"
            alt="Athul P"
            draggable={false}
            className="block w-auto select-none pointer-events-none"
            style={{
              height: "min(86%, 540px)",
              maxWidth: "92%",
              objectFit: "contain",
            }}
            animate={{
              filter: [
                "drop-shadow(0 12px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 22px rgba(139,92,246,0.32)) drop-shadow(0 0 50px rgba(34,211,238,0.18))",
                "drop-shadow(0 12px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(34,211,238,0.36)) drop-shadow(0 0 64px rgba(139,92,246,0.22))",
                "drop-shadow(0 12px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 22px rgba(139,92,246,0.32)) drop-shadow(0 0 50px rgba(34,211,238,0.18))",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Locking reticle that breathes around the subject's face area */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ top: "22%" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="size-24 rounded-full border border-neon-cyan/60" />
          <span className="absolute top-1/2 -left-2 w-3 h-px bg-neon-cyan" />
          <span className="absolute top-1/2 -right-2 w-3 h-px bg-neon-cyan" />
          <span className="absolute left-1/2 -top-2 h-3 w-px bg-neon-cyan" />
          <span className="absolute left-1/2 -bottom-2 h-3 w-px bg-neon-cyan" />
        </motion.div>

        {/* Scan sweep across the subject */}
        <motion.div
          aria-hidden
          className="absolute left-0 right-0 h-20 mix-blend-screen pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0) 30%, rgba(34,211,238,0.45) 50%, rgba(34,211,238,0) 70%, transparent 100%)",
            filter: "blur(3px)",
          }}
          initial={{ top: "0%", opacity: 0 }}
          animate={{ top: ["0%", "100%"], opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.6 }}
        />

        {/* Top status bar */}
        <div className="absolute top-0 inset-x-0 h-9 border-b border-white/5 flex items-center justify-between px-4 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <motion.span
              className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_8px_#a3e635]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-ink-dim">
              ATHION_AI · MODEL v2.1
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] text-ink-mute uppercase tracking-widest">
            <span>REC</span>
            <motion.span
              className="size-1.5 rounded-full bg-rose-500"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Bottom status bar — frame counter + processing bar */}
        <div className="absolute bottom-0 inset-x-0 px-4 py-2 border-t border-white/5 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center justify-between font-mono text-[9px] text-ink-mute uppercase tracking-widest mb-1.5">
            <span>RENDERING · 99.7%</span>
            <FrameCounter />
          </div>
          <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Left rail — vertical data labels */}
        <div className="absolute left-2 top-12 flex flex-col gap-3 font-mono text-[8px] tracking-[0.3em] uppercase text-ink-mute">
          <RailMetric label="bio" value="0.92" />
          <RailMetric label="sync" value="100%" />
          <RailMetric label="iso" value="adt" />
        </div>

        {/* Right rail — animated bars */}
        <div className="absolute right-2 top-12 flex flex-col items-end gap-2 font-mono text-[8px] tracking-[0.3em] uppercase text-ink-mute">
          <RailBars />
          <span className="text-neon-cyan">DEPTH · 24</span>
          <span>RES · 4K</span>
        </div>

        {/* Corner brackets */}
        <CornerBracket pos="top-left" />
        <CornerBracket pos="top-right" />
        <CornerBracket pos="bottom-left" />
        <CornerBracket pos="bottom-right" />

        {/* Network nodes scattered subtly */}
        <NetworkNodes />
      </div>
    </motion.div>
  );
}

function RailMetric({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span>{label}</span>
      <span className="text-neon-cyan">{value}</span>
    </div>
  );
}

function RailBars() {
  const bars = [3, 6, 4, 7, 5, 8, 6, 9, 5, 4, 6];
  return (
    <div className="flex items-end gap-[2px] h-5">
      {bars.map((b, i) => (
        <motion.span
          key={i}
          className="w-[2px] bg-neon-cyan/80 rounded-sm"
          initial={{ height: 3 }}
          animate={{ height: [3, b * 2, 3] }}
          transition={{
            duration: 1.2,
            delay: i * 0.05,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function CornerBracket({ pos }) {
  const map = {
    "top-left": "top-10 left-2.5",
    "top-right": "top-10 right-2.5 rotate-90",
    "bottom-left": "bottom-10 left-2.5 -rotate-90",
    "bottom-right": "bottom-10 right-2.5 rotate-180",
  };
  return (
    <div className={`absolute size-4 ${map[pos]}`} aria-hidden>
      <span className="absolute top-0 left-0 w-3 h-px bg-neon-cyan" />
      <span className="absolute top-0 left-0 w-px h-3 bg-neon-cyan" />
    </div>
  );
}

function FrameCounter() {
  const [n, setN] = useState(421);
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1), 90);
    return () => clearInterval(id);
  }, []);
  return <span className="text-neon-cyan">FRAME {String(n).padStart(4, "0")}</span>;
}

function NetworkNodes() {
  const nodes = [
    { x: 14, y: 30 },
    { x: 86, y: 36 },
    { x: 22, y: 70 },
    { x: 78, y: 76 },
    { x: 50, y: 14 },
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-[1.5px] rounded-[26px] pointer-events-none"
    >
      <g stroke="rgba(34,211,238,0.18)" strokeWidth="0.15" fill="none">
        <path d="M14 30 L 50 14 L 86 36" />
        <path d="M22 70 L 50 14 L 78 76" />
        <path d="M22 70 L 78 76" />
      </g>
      {nodes.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="0.6"
          fill="#22d3ee"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
}

function Readout({ k, v }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-ink-mute">{k}</span>
      <span className="text-neon-cyan">{v}</span>
    </div>
  );
}
