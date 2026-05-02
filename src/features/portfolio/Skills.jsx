import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  cubicBezier,
} from "framer-motion";
import { Layers, Server, Cpu, Boxes } from "lucide-react";

/**
 * Skills / "02 · Stack" — cinematic AI lab.
 *
 *   The portrait is treated as a "subject under analysis" by the AI:
 *   chromatic split + holographic scanlines + a moving scan bar, framed
 *   by an animated HUD (corner brackets, spinning reticle, pulse ring)
 *   and surrounded by floating telemetry readouts. Behind everything,
 *   a neural-net field of nodes & connecting lines breathes with mouse
 *   parallax. Cards keep their four signature animations on top.
 *
 *   Card 1 · Frontend  → SLIDE FROM LEFT
 *   Card 2 · Backend   → DROP FROM TOP (forward tilt)
 *   Card 3 · AI & Data → IRIS OPEN (Y-axis flip)
 *   Card 4 · DevOps    → Z-DOLLY (rushes from far away)
 */

const easeIO = cubicBezier(0.65, 0, 0.35, 1);
const stillEase = cubicBezier(0.4, 0, 0.6, 1);

const GROUPS = [
  {
    title: "Frontend",
    icon: Layers,
    items: ["React", "Next.js", "TypeScript", "Zustand", "Redux Toolkit", "Tailwind", "Framer Motion", "Three.js"],
  },
  {
    title: "Backend",
    icon: Server,
    items: ["Node.js", "Express", "Prisma", "Sequelize", "Socket.IO", "REST", "Firebase"],
  },
  {
    title: "AI & Data",
    icon: Cpu,
    items: ["OpenAI", "RAG", "Embeddings", "Vector search", "MySQL", "MongoDB"],
  },
  {
    title: "DevOps",
    icon: Boxes,
    items: ["Vite", "Webpack", "Vercel", "Netlify", "Render", "DigitalOcean", "Contabo"],
  },
];

export function Skills() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const p = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    mass: 0.5,
  });

  // Mobile gate — desktop card animations (slide -58vw, drop -46vh,
  // 88° iris flip, z-1100 dolly) look broken inside a 1-col stack; on
  // mobile we swap them for a clean fade-up sequence.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Mouse position (-0.5 .. 0.5) for parallax / 3D tilt across the section.
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

  // === Ambient bg layers =================================================
  const bgY = useTransform(p, [0, 1], ["-6%", "6%"]);
  const bgOpacity = useTransform(p, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);

  // === Eyebrow ===========================================================
  const eyebrowX = useTransform(
    p,
    [0, 0.32, 0.65, 1],
    ["-12vw", "0vw", "0vw", "12vw"],
    { ease: easeIO },
  );
  const eyebrowOpacity = useTransform(p, [0.04, 0.28, 0.7, 0.95], [0, 1, 1, 0]);

  // === Heading ===========================================================
  const headingY = useTransform(
    p,
    [0, 0.42, 0.62, 1],
    ["18vh", "0vh", "0vh", "-20vh"],
    { ease: easeIO },
  );
  const headingOpacity = useTransform(p, [0.06, 0.36, 0.66, 0.95], [0, 1, 1, 0]);
  const headingBlur = useTransform(
    p,
    [0, 0.36, 0.66, 1],
    ["blur(14px)", "blur(0px)", "blur(0px)", "blur(10px)"],
  );

  // Mobile gets a completely separate, static layout. The pinned-scroll
  // choreography (sticky stage + scroll-driven motion values feeding
  // bgY / eyebrowX / headingY / portrait y/scale/blur etc.) is the
  // remaining cause of the fuzzy text on iOS — every scroll tick keeps
  // the entire pinned area in a continuously-recompositing GPU layer,
  // and the cards inside that layer rasterize at sub-pixel positions.
  // Mobile bypasses all of it: no sticky, no scroll-progress motion
  // values driving bg/heading/portrait, no perspective, no preserve-3d.
  if (isMobile) return <SkillsMobile />;

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative h-[200svh] md:h-[300svh]"
      style={{ perspective: 1600 }}
    >
      <div
        className="sticky top-0 h-[100svh] overflow-hidden flex items-center"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ willChange: "transform", contain: "paint" }}
      >
        {/* === Ambient bg ============================================= */}
        <motion.div
          style={{ y: bgY, opacity: bgOpacity }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 600px at 50% 30%, rgba(34,211,238,0.10), transparent 70%), radial-gradient(700px 500px at 50% 90%, rgba(139,92,246,0.12), transparent 70%)",
            }}
          />
          <div className="absolute inset-0 grid-bg opacity-25" />
        </motion.div>

        {/* === AI neural network field (mouse parallax) =============== */}
        <NeuralField mx={mx} my={my} />

        {/* === Glow halo behind portrait ============================== */}
        <HoloHalo progress={p} />

        {/* === Holographic portrait =================================== */}
        <HoloPortrait progress={p} mx={mx} my={my} isMobile={isMobile} />

        {/* === Periodic scan + drifting particles ===================== */}
        <ScanSweep />
        <ParticleField />

        {/* === Vignette so cards stay readable ======================== */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(72% 60% at 50% 50%, rgba(5,6,10,0.0) 0%, rgba(5,6,10,0.55) 60%, rgba(5,6,10,0.88) 100%)",
          }}
        />

        {/* === HUD frame around portrait ============================== */}
        <HudFrame progress={p} mx={mx} my={my} />

        {/* === Floating telemetry readouts ============================ */}
        <DataReadouts progress={p} />

        {/* Side rail (desktop only) */}
        <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 pointer-events-none">
          <div className="rotate-180 [writing-mode:vertical-rl] font-mono text-[10px] tracking-[0.45em] uppercase text-ink-mute">
            stack · v2.1 · running
          </div>
          <motion.span
            className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_10px_#a3e635]"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* === Content ================================================ */}
        <div
          className="relative mx-auto max-w-7xl w-full px-5 md:px-6"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            style={{ x: eyebrowX, opacity: eyebrowOpacity }}
            className="font-mono text-[10px] md:text-xs tracking-[0.35em] md:tracking-[0.45em] uppercase text-neon-violet flex items-center gap-2"
          >
            <span className="block w-6 h-px bg-neon-violet" />
            02 · Stack
          </motion.div>

          <motion.h2
            style={{
              y: headingY,
              opacity: headingOpacity,
              filter: headingBlur,
            }}
            className="mt-2 md:mt-4 font-display text-[1.7rem] sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]"
          >
            Tools, <span className="text-gradient">sharpened.</span>
          </motion.h2>

          <div className="mt-6 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
            <CardSlideLeft  group={GROUPS[0]} progress={p} accent="cyan"   stagger={0.00} isMobile={false} />
            <CardDropTop    group={GROUPS[1]} progress={p} accent="violet" stagger={0.04} isMobile={false} />
            <CardIrisOpen   group={GROUPS[2]} progress={p} accent="pink"   stagger={0.08} isMobile={false} />
            <CardZDolly     group={GROUPS[3]} progress={p} accent="lime"   stagger={0.12} isMobile={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * Shared helpers
 * ========================================================================= */
function useCardOpacity(progress, stagger) {
  return useTransform(
    progress,
    [0.05 + stagger, 0.40 + stagger, 0.62 + stagger * 0.4, 0.94 + stagger * 0.2],
    [0, 1, 1, 0],
  );
}

/**
 * Shared mobile card motion: each card rises from below + fades in,
 * holds, then drifts up + fades out. No extreme x/z/rotate so the 1-col
 * stack stays readable on small phones.
 *
 * `y` is computed in unitless pixels and snapped to whole integers via a
 * second `useTransform`. The previous version used `vh` strings, which
 * interpolated to sub-pixel values mid-scroll — and sub-pixel transforms
 * are exactly what iOS Safari renders fuzzy text inside. Integer-pixel
 * `y` values are always crisp.
 */
function useMobileCardStyle(progress, stagger) {
  const enter = 0.18 + stagger * 1.6;
  const exit = 0.78 + stagger * 0.4;
  const yRaw = useTransform(
    progress,
    [0, enter, exit, 1],
    [140, 0, 0, -110],
    { ease: easeIO },
  );
  const y = useTransform(yRaw, (v) => Math.round(v));
  const opacity = useTransform(
    progress,
    [
      Math.max(0, enter - 0.16),
      enter,
      exit,
      Math.min(1, exit + 0.14),
    ],
    [0, 1, 1, 0],
  );
  return { y, opacity };
}

const ACCENT = {
  cyan: "rgba(34,211,238,0.22)",
  violet: "rgba(139,92,246,0.22)",
  pink: "rgba(244,114,182,0.22)",
  lime: "rgba(163,230,53,0.20)",
};
const ICON_COLOR = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  pink: "#f472b6",
  lime: "#a3e635",
};

function CardShell({ group, accent, style, label, isMobile, stagger = 0 }) {
  const Icon = group.icon;

  // Mobile uses a one-shot `whileInView` entry instead of continuous
  // scroll-driven motion values. After the card settles into y:0/opacity:1
  // there's NO motion value animating it — so text renders exactly as it
  // would on a static <div>. This is the only reliable way to get crisp
  // text on iOS Safari, which renders fuzzy whenever a transform is
  // driven by a live motion value (even with integer-pixel rounding).
  const motionProps = isMobile
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: {
          duration: 0.55,
          ease: easeIO,
          delay: stagger * 4,
        },
      }
    : {
        style: { ...style, transformStyle: "preserve-3d" },
        whileHover: { y: -6 },
      };

  return (
    <motion.div
      {...motionProps}
      className="group relative overflow-hidden rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/10 shadow-glass bg-bg-panel md:bg-white/[0.04] md:backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 pointer-events-none"
        style={{
          background: `radial-gradient(80% 60% at 0% 0%, ${ACCENT[accent]}, transparent 70%)`,
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-2.5">
          <div
            className="size-8 md:size-9 rounded-lg grid place-items-center bg-white/5 border border-white/10"
            style={{ boxShadow: `0 0 12px ${ACCENT[accent]}` }}
          >
            <Icon className="size-3.5 md:size-4" style={{ color: ICON_COLOR[accent] }} />
          </div>
          <h3 className="font-display font-semibold text-sm md:text-lg">
            {group.title}
          </h3>
        </div>
        <span className="font-mono text-[8px] md:text-[9px] text-ink-mute tracking-widest uppercase">
          {label}
        </span>
      </div>

      <div className="mt-3 md:mt-5 flex flex-wrap gap-1 md:gap-2">
        {group.items.map((it) => (
          <span
            key={it}
            className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-xs text-ink-dim group-hover:border-neon-cyan/40 group-hover:text-ink transition"
          >
            {it}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* =========================================================================
 * Card 1 — Frontend · SLIDE FROM LEFT  (desktop) · FADE-RISE  (mobile)
 * ========================================================================= */
function CardSlideLeft({ group, progress, accent, stagger, isMobile }) {
  const enter = 0.40 + stagger;
  const exit = 0.62 + stagger * 0.4;

  const x = useTransform(
    progress,
    [0, enter, exit, 1],
    ["-58vw", "0vw", "0vw", "58vw"],
    { ease: easeIO },
  );
  const rotateZ = useTransform(
    progress,
    [0, enter, exit, 1],
    [-10, 0, 0, 10],
    { ease: easeIO },
  );
  const blur = useTransform(progress, [0, enter, exit, 1], [
    "blur(10px)",
    "blur(0px)",
    "blur(0px)",
    "blur(8px)",
  ]);
  const opacity = useCardOpacity(progress, stagger);

  return (
    <CardShell
      group={group}
      accent={accent}
      label="// SLIDE"
      isMobile={isMobile}
      stagger={stagger}
      style={isMobile ? undefined : { x, rotateZ, opacity, filter: blur }}
    />
  );
}

/* =========================================================================
 * Card 2 — Backend · DROP FROM TOP  (desktop) · FADE-RISE  (mobile)
 * ========================================================================= */
function CardDropTop({ group, progress, accent, stagger, isMobile }) {
  const enter = 0.40 + stagger;
  const exit = 0.62 + stagger * 0.4;

  const y = useTransform(
    progress,
    [0, enter, exit, 1],
    ["-46vh", "0vh", "0vh", "46vh"],
    { ease: easeIO },
  );
  const rotateX = useTransform(
    progress,
    [0, enter, exit, 1],
    [-32, 0, 0, 28],
    { ease: easeIO },
  );
  const scale = useTransform(progress, [0, enter, exit, 1], [0.9, 1, 1, 0.9], {
    ease: easeIO,
  });
  const blur = useTransform(progress, [0, enter, exit, 1], [
    "blur(8px)",
    "blur(0px)",
    "blur(0px)",
    "blur(8px)",
  ]);
  const opacity = useCardOpacity(progress, stagger);

  return (
    <CardShell
      group={group}
      accent={accent}
      label="// DROP"
      isMobile={isMobile}
      stagger={stagger}
      style={isMobile ? undefined : { y, rotateX, scale, opacity, filter: blur }}
    />
  );
}

/* =========================================================================
 * Card 3 — AI & Data · IRIS OPEN  (desktop) · FADE-RISE  (mobile)
 * ========================================================================= */
function CardIrisOpen({ group, progress, accent, stagger, isMobile }) {
  const enter = 0.40 + stagger;
  const exit = 0.62 + stagger * 0.4;

  const scale = useTransform(
    progress,
    [0, enter, exit, 1],
    [0.25, 1, 1, 0.25],
    { ease: easeIO },
  );
  const rotateY = useTransform(
    progress,
    [0, enter, exit, 1],
    [88, 0, 0, -88],
    { ease: easeIO },
  );
  const opacity = useCardOpacity(progress, stagger);

  return (
    <CardShell
      group={group}
      accent={accent}
      label="// IRIS"
      isMobile={isMobile}
      stagger={stagger}
      style={isMobile ? undefined : { scale, rotateY, opacity }}
    />
  );
}

/* =========================================================================
 * Card 4 — DevOps · Z-DOLLY  (desktop) · FADE-RISE  (mobile)
 * ========================================================================= */
function CardZDolly({ group, progress, accent, stagger, isMobile }) {
  const enter = 0.40 + stagger;
  const exit = 0.62 + stagger * 0.4;

  const z = useTransform(
    progress,
    [0, enter, exit, 1],
    [-1100, 0, 0, 1100],
    { ease: easeIO },
  );
  const blur = useTransform(progress, [0, enter, exit, 1], [
    "blur(22px)",
    "blur(0px)",
    "blur(0px)",
    "blur(20px)",
  ]);
  const rotateZ = useTransform(progress, [0, enter, exit, 1], [6, 0, 0, -6], {
    ease: easeIO,
  });
  const opacity = useCardOpacity(progress, stagger);

  return (
    <CardShell
      group={group}
      accent={accent}
      label="// DOLLY"
      isMobile={isMobile}
      stagger={stagger}
      style={isMobile ? undefined : { z, rotateZ, opacity, filter: blur }}
    />
  );
}

/* =========================================================================
 * Ambient & cinematic helpers
 * ========================================================================= */
function ScanSweep() {
  return (
    <motion.div
      aria-hidden
      className="absolute left-0 right-0 h-32 mix-blend-screen pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0) 30%, rgba(34,211,238,0.18) 50%, rgba(34,211,238,0) 70%, transparent 100%)",
        filter: "blur(4px)",
      }}
      initial={{ top: "-15%", opacity: 0 }}
      animate={{ top: ["-15%", "115%"], opacity: [0, 0.6, 0] }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 1.8,
      }}
    />
  );
}

function ParticleField() {
  const dots = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: (i * 53) % 100,
    top: (i * 31) % 100,
    delay: (i % 6) * 0.5,
    dur: 7 + (i % 5),
    size: 1 + ((i * 7) % 3),
  }));
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
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

/* -------------------------------------------------------------------------
 * HoloHalo — radial glow behind the portrait, slowly breathing
 * ------------------------------------------------------------------------- */
function HoloHalo({ progress }) {
  const opacity = useTransform(progress, [0, 0.2, 0.78, 1], [0, 1, 1, 0]);
  const scrollScale = useTransform(progress, [0, 0.5, 1], [0.9, 1, 1.06], {
    ease: stillEase,
  });

  return (
    <motion.div
      style={{ opacity, scale: scrollScale }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      <motion.div
        className="rounded-full"
        style={{
          width: "min(95vw, 760px)",
          height: "min(95vw, 760px)",
          background:
            "radial-gradient(closest-side, rgba(34,211,238,0.20), rgba(139,92,246,0.12) 45%, transparent 72%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
 * HoloPortrait — your image, treated as a holographic AI subject:
 *   · Two chromatic ghosts (cyan / violet) drift apart at scroll edges
 *   · Scanline overlay + a vertical scan bar that loops over the face
 *   · Subtle digital grain
 *   · Mouse-driven 3D tilt + scroll-driven scale / opacity / blur
 * ------------------------------------------------------------------------- */
function HoloPortrait({ progress, mx, my, isMobile }) {
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 80,
    damping: 22,
  });
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 80,
    damping: 22,
  });

  const scale = useTransform(progress, [0, 0.5, 1], [1.18, 1, 1.05], {
    ease: stillEase,
  });
  const y = useTransform(progress, [0, 1], ["10%", "-10%"]);
  // Mobile keeps the portrait subtle (peak ~0.18) so the stacked cards
  // stay the focal point; desktop gets the full holographic presence.
  const opacityDesktop = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    [0, 0.5, 0.55, 0.5, 0],
    { ease: stillEase },
  );
  const opacityMobile = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    [0, 0.16, 0.2, 0.16, 0],
    { ease: stillEase },
  );
  const opacity = isMobile ? opacityMobile : opacityDesktop;
  const blur = useTransform(
    progress,
    [0, 0.22, 0.78, 1],
    ["blur(12px)", "blur(0px)", "blur(0px)", "blur(10px)"],
  );

  // Chromatic split — ghosts drift apart at the edges of the scroll band.
  // Reduce the split on mobile so the ghost edges don't bleed past the
  // smaller subject and look like a render glitch.
  const splitMax = isMobile ? 8 : 16;
  const cyanX = useTransform(
    progress,
    [0, 0.25, 0.5, 0.75, 1],
    [-splitMax, -2, 0, 2, splitMax],
  );
  const violetX = useTransform(cyanX, (v) => -v);

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        // Drop the portrait's filter:blur on mobile — at the section's
        // scroll edges this was applying a 12px gaussian blur to all
        // four image layers behind the cards, which (combined with the
        // cards' own backdrop-blur) made the whole stack read fuzzy.
        filter: isMobile ? undefined : blur,
        rotateX: tiltX,
        rotateY: tiltY,
        transformStyle: "preserve-3d",
        transformPerspective: 1400,
      }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
    >
      <div
        className="relative"
        style={{
          height: isMobile
            ? "clamp(260px, 48svh, 460px)"
            : "clamp(360px, 70svh, 720px)",
          width: isMobile ? "min(64vw, 280px)" : "min(82vw, 560px)",
        }}
      >
        {/* Cyan ghost */}
        <motion.img
          src="/profile1.png"
          alt=""
          aria-hidden
          draggable={false}
          style={{
            x: cyanX,
            filter: "hue-rotate(170deg) saturate(2.2) brightness(1.1)",
            mixBlendMode: "screen",
          }}
          className="absolute inset-0 w-full h-full object-contain opacity-30"
        />
        {/* Violet ghost */}
        <motion.img
          src="/profile1.png"
          alt=""
          aria-hidden
          draggable={false}
          style={{
            x: violetX,
            filter: "hue-rotate(290deg) saturate(2.2) brightness(1.1)",
            mixBlendMode: "screen",
          }}
          className="absolute inset-0 w-full h-full object-contain opacity-30"
        />
        {/* Main subject */}
        <img
          src="/profile1.png"
          alt=""
          aria-hidden
          draggable={false}
          style={{ filter: "contrast(1.05) brightness(0.95)" }}
          className="relative w-full h-full object-contain"
        />

        {/* Holographic scanlines clipped to portrait area */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(34,211,238,0.18) 0px, rgba(34,211,238,0.18) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Looping scan bar over the portrait */}
        <motion.div
          className="absolute left-0 right-0 h-20 mix-blend-screen pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(34,211,238,0.55), transparent)",
            filter: "blur(2px)",
          }}
          animate={{ top: ["-15%", "115%"] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.4,
          }}
        />

        {/* Subtle digital grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
 * HudFrame — corner brackets, a slowly spinning reticle around the face,
 * a pulse ring expanding outward, and small mono labels.
 * ------------------------------------------------------------------------- */
function HudFrame({ progress, mx, my }) {
  const px = useSpring(useTransform(mx, [-0.5, 0.5], [12, -12]), {
    stiffness: 60,
    damping: 20,
  });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 60,
    damping: 20,
  });

  const opacity = useTransform(progress, [0.05, 0.25, 0.75, 0.95], [0, 1, 1, 0]);
  const enterScale = useTransform(progress, [0.05, 0.28], [1.12, 1]);

  return (
    <motion.div
      style={{ x: px, y: py, opacity, scale: enterScale }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
    >
      <div
        className="relative"
        style={{
          width: "min(78vw, 540px)",
          height: "clamp(360px, 70svh, 720px)",
        }}
      >
        {/* Corner brackets */}
        <span className="absolute -top-1 -left-1 w-9 h-9 border-l-2 border-t-2 border-neon-cyan/80" />
        <span className="absolute -top-1 -right-1 w-9 h-9 border-r-2 border-t-2 border-neon-cyan/80" />
        <span className="absolute -bottom-1 -left-1 w-9 h-9 border-l-2 border-b-2 border-neon-cyan/80" />
        <span className="absolute -bottom-1 -right-1 w-9 h-9 border-r-2 border-b-2 border-neon-cyan/80" />

        {/* Top / bottom labels */}
        <div className="absolute -top-6 left-10 font-mono text-[10px] tracking-[0.4em] uppercase text-neon-cyan/80">
          subject :: athion
        </div>
        <div className="absolute -bottom-6 right-10 font-mono text-[10px] tracking-[0.4em] uppercase text-neon-cyan/60">
          ◢ analysis 100%
        </div>

        {/* Spinning reticle around the face area */}
        <motion.div
          className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative size-32 rounded-full border border-neon-cyan/40">
            <div className="absolute inset-4 rounded-full border border-neon-cyan/30" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-3 bg-neon-cyan/80" />
            <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-px h-3 bg-neon-cyan/80" />
            <span className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-px bg-neon-cyan/80" />
            <span className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-px bg-neon-cyan/80" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-1 rounded-full bg-neon-cyan shadow-[0_0_8px_#22d3ee]" />
          </div>
        </motion.div>

        {/* Outward pulse ring */}
        <motion.div
          className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 size-32 rounded-full border border-neon-cyan/60"
          animate={{ scale: [1, 2.2], opacity: [0.55, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
 * DataReadouts — typewriter-style telemetry labels at the four corners.
 * ------------------------------------------------------------------------- */
function DataReadouts({ progress }) {
  const opacity = useTransform(progress, [0.15, 0.32, 0.7, 0.9], [0, 1, 1, 0]);

  const items = [
    { pos: "top-[12%] left-[5%]",     color: "text-neon-cyan/80",   lines: ["> SUBJECT_LOCKED", "ID :: ATHION-0xA73"] },
    { pos: "top-[16%] right-[5%]",    color: "text-neon-violet/80", lines: ["NEURAL_LINK ▮▮▮▮▮", "STATUS :: ACTIVE"] },
    { pos: "bottom-[20%] left-[5%]",  color: "text-neon-lime/80",   lines: ["MEM 2.4GB / 8GB", "RAG :: ONLINE"] },
    { pos: "bottom-[24%] right-[5%]", color: "text-neon-pink/80",   lines: ["LATENCY 12ms ◆ FPS 60", "MODEL :: opus-4-7"] },
  ];

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 pointer-events-none hidden lg:block"
    >
      {items.map((it, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.3 + i * 0.18, duration: 0.7 }}
          className={`absolute ${it.pos} font-mono text-[10px] leading-relaxed tracking-wider ${it.color}`}
        >
          {it.lines.map((l, j) => (
            <div key={j}>{l}</div>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
 * NeuralField — SVG nodes + connecting lines drifting on mouse parallax.
 * ------------------------------------------------------------------------- */
function NeuralField({ mx, my }) {
  const { nodes, lines } = useMemo(() => {
    const N = 22;
    const ns = [];
    for (let i = 0; i < N; i++) {
      const x = (i * 47.3 + 11) % 100;
      const y = (i * 29.7 + 7) % 100;
      ns.push({ id: i, x, y, delay: (i % 7) * 0.45, dur: 3 + (i % 4) });
    }
    const ls = [];
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x;
        const dy = ns[i].y - ns[j].y;
        if (Math.hypot(dx, dy) < 24) {
          ls.push({
            a: ns[i],
            b: ns[j],
            dur: 5 + ((i + j) % 4),
            delay: (i % 6) * 0.3,
          });
        }
      }
    }
    return { nodes: ns, lines: ls };
  }, []);

  const px = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), {
    stiffness: 50,
    damping: 22,
  });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [-12, 12]), {
    stiffness: 50,
    damping: 22,
  });

  return (
    <motion.div
      style={{ x: px, y: py }}
      className="absolute inset-0 pointer-events-none hidden sm:block"
    >
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {lines.map((ln, i) => (
          <motion.line
            key={`l-${i}`}
            x1={`${ln.a.x}%`}
            y1={`${ln.a.y}%`}
            x2={`${ln.b.x}%`}
            y2={`${ln.b.y}%`}
            stroke="rgba(34,211,238,0.22)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.05, 0.45, 0.1, 0.4] }}
            transition={{
              duration: ln.dur,
              repeat: Infinity,
              delay: ln.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
      {nodes.map((n) => (
        <motion.span
          key={n.id}
          className="absolute size-1.5 rounded-full bg-neon-cyan -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            boxShadow: "0 0 8px rgba(34,211,238,0.85)",
          }}
          animate={{ scale: [1, 1.7, 1], opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: n.dur,
            repeat: Infinity,
            delay: n.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

/* =========================================================================
 * SkillsMobile — fully static layout for phones.
 *
 * No sticky pinning, no scroll-progress motion values, no perspective,
 * no preserve-3d, no will-change, no filters. Heading + cards animate
 * once via whileInView with `once: true`, after which framer-motion
 * releases their transforms and they render as plain DOM elements —
 * the only reliable way to defeat iOS Safari's fuzzy-text raster bug.
 * ========================================================================= */
function SkillsMobile() {
  const groups = [
    { key: GROUPS[0], accent: "cyan",   label: "// 01" },
    { key: GROUPS[1], accent: "violet", label: "// 02" },
    { key: GROUPS[2], accent: "pink",   label: "// 03" },
    { key: GROUPS[3], accent: "lime",   label: "// 04" },
  ];

  return (
    <section id="skills" className="relative py-16 overflow-hidden">
      {/* Static ambient bg — no motion values, no filters */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 600px at 50% 30%, rgba(34,211,238,0.10), transparent 70%), radial-gradient(700px 500px at 50% 90%, rgba(139,92,246,0.12), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(72% 60% at 50% 50%, rgba(5,6,10,0.0) 0%, rgba(5,6,10,0.55) 60%, rgba(5,6,10,0.88) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl w-full px-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easeIO }}
          className="font-mono text-[10px] tracking-[0.35em] uppercase text-neon-violet flex items-center gap-2"
        >
          <span className="block w-6 h-px bg-neon-violet" />
          02 · Stack
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: easeIO, delay: 0.12 }}
          className="mt-2 font-display text-[1.7rem] sm:text-4xl font-semibold tracking-tight leading-[1.05]"
        >
          Tools, <span className="text-gradient">sharpened.</span>
        </motion.h2>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {groups.map((g, i) => (
            <MobileSkillCard
              key={g.key.title}
              group={g.key}
              accent={g.accent}
              label={g.label}
              delay={0.1 * i + 0.2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MobileSkillCard({ group, accent, label, delay }) {
  const Icon = group.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: easeIO, delay }}
      className="relative overflow-hidden rounded-xl p-4 border border-white/10 shadow-glass bg-bg-panel"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 pointer-events-none"
        style={{
          background: `radial-gradient(80% 60% at 0% 0%, ${ACCENT[accent]}, transparent 70%)`,
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="size-9 rounded-lg grid place-items-center bg-white/5 border border-white/10"
            style={{ boxShadow: `0 0 12px ${ACCENT[accent]}` }}
          >
            <Icon className="size-4" style={{ color: ICON_COLOR[accent] }} />
          </div>
          <h3 className="font-display font-semibold text-base">
            {group.title}
          </h3>
        </div>
        <span className="font-mono text-[8px] text-ink-mute tracking-widest uppercase">
          {label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {group.items.map((it) => (
          <span
            key={it}
            className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-ink-dim"
          >
            {it}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
