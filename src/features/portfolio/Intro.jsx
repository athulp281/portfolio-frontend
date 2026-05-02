import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useProjectStore } from "@/store";

/**
 * Intro / "01 · About" — scroll-staged with 3D parallax entry & exit.
 *
 * Architecture mirrors the Hero:
 *   • Section is 200svh tall; an inner sticky stage pins through scroll.
 *   • scrollYProgress is mapped via spring → component transforms.
 *   • Each element uses 4-stop input ranges [0, 0.35, 0.65, 1]:
 *       0     →  off-screen "from" pose  (entering)
 *       0.35  →  resting pose            (entry complete)
 *       0.65  →  resting pose            (exit begins)
 *       1     →  off-screen "to" pose    (exit complete)
 *   • Each stat card has its own direction so the grid breathes outward
 *     on entry and scatters opposite directions on exit.
 *   • Lenis (App.jsx) smooths global scroll; spring smooths value mapping.
 */

const STATS = [
  { label: "Years building", value: "4+" },
  { label: "Projects shipped", value: "12+" },
  { label: "AI systems", value: "RAG · LLM" },
  { label: "Stack depth", value: "FE · BE · Infra" },
];

// Directional config for each stat — entry FROM, exit TO.
// Modest magnitudes so the choreography reads on phones too.
const STAT_DIRS = [
  { fromX: "-22vw", fromY: "18vh", fromRot: -8, toX: "22vw", toY: "-18vh", toRot: 8 },
  { fromX: "22vw", fromY: "18vh", fromRot: 8, toX: "-22vw", toY: "-18vh", toRot: -8 },
  { fromX: "-22vw", fromY: "-18vh", fromRot: 8, toX: "22vw", toY: "18vh", toRot: -8 },
  { fromX: "22vw", fromY: "-18vh", fromRot: -8, toX: "-22vw", toY: "18vh", toRot: 8 },
];

export function Intro() {
  const sectionRef = useRef(null);
  const personal = useProjectStore((s) => s.personal);
  const loadProfile = useProjectStore((s) => s.loadProfile);

  useEffect(() => {
    if (personal.length === 0) loadProfile();
  }, [personal.length, loadProfile]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 40,
    mass: 0.35,
  });

  // === Background parallax (slowest) ====================================
  const bgY = useTransform(p, [0, 1], ["-12%", "12%"]);
  const bgOpacity = useTransform(p, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // === Portrait backdrop (profile4.png) — slow drift + scale + opacity ==
  const portraitY = useTransform(p, [0, 1], ["-6%", "6%"]);
  const portraitX = useTransform(p, [0, 1], ["2%", "-2%"]);
  const portraitScale = useTransform(p, [0, 0.5, 1], [0.95, 1.02, 0.95]);
  const portraitOpacity = useTransform(
    p,
    [0, 0.18, 0.5, 0.82, 1],
    [0, 0.45, 0.55, 0.45, 0],
  );

  // === Eyebrow ("01 · About") ===========================================
  const eyebrowY = useTransform(p, [0, 0.32, 0.65, 1], ["18vh", "0vh", "0vh", "-18vh"]);
  const eyebrowOpacity = useTransform(p, [0.04, 0.28, 0.7, 0.95], [0, 1, 1, 0]);
  const eyebrowRotateX = useTransform(p, [0, 0.32, 0.65, 1], [40, 0, 0, -40]);

  // === Heading =========================================================
  const headingY = useTransform(p, [0, 0.36, 0.65, 1], ["24vh", "0vh", "0vh", "-26vh"]);
  const headingOpacity = useTransform(p, [0.06, 0.32, 0.7, 0.95], [0, 1, 1, 0]);
  const headingRotateX = useTransform(p, [0, 0.36, 0.65, 1], [28, 0, 0, -28]);
  const headingScale = useTransform(p, [0, 0.36, 0.65, 1], [0.78, 1, 1, 0.86]);
  const headingBlur = useTransform(p, [0, 0.32, 0.7, 1], [
    "blur(18px)",
    "blur(0px)",
    "blur(0px)",
    "blur(14px)",
  ]);

  // === Paragraph =======================================================
  const paraX = useTransform(p, [0, 0.4, 0.65, 1], ["-26vw", "0vw", "0vw", "26vw"]);
  const paraOpacity = useTransform(p, [0.1, 0.36, 0.72, 0.96], [0, 1, 1, 0]);
  const paraRotateY = useTransform(p, [0, 0.4, 0.65, 1], [22, 0, 0, -22]);

  // === Decorative side-rail line =======================================
  const railScaleY = useTransform(p, [0.05, 0.42, 0.7, 0.98], [0, 1, 1, 0]);
  const railOpacity = useTransform(p, [0.1, 0.4, 0.7, 0.95], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative h-[180svh] md:h-[200svh]"
      style={{ perspective: 1400 }}
    >
      <div
        className="sticky top-0 h-[100svh] overflow-hidden flex items-center"
        style={{ willChange: "transform", contain: "paint" }}
      >
        {/* === Background parallax layers =============================== */}
        <motion.div
          style={{ y: bgY, opacity: bgOpacity }}
          className="absolute inset-0 -z-10"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 600px at 30% 30%, rgba(34,211,238,0.12), transparent 70%), radial-gradient(700px 500px at 80% 70%, rgba(139,92,246,0.14), transparent 70%)",
            }}
          />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </motion.div>

        {/* === Portrait backdrop (profile4) ============================
            Slow drift + breathing scale, kept very low-opacity so the
            heading and stats remain readable. Sits above the radial bg
            but below the content. */}
        <motion.div
          aria-hidden
          style={{
            y: portraitY,
            x: portraitX,
            scale: portraitScale,
            opacity: portraitOpacity,
          }}
          className="absolute inset-0 -z-[5] pointer-events-none flex items-center justify-end"
        >
          <div className="relative w-[55vw] max-w-[420px] md:max-w-[480px] aspect-square mr-4 md:mr-16 lg:mr-28">
            <img
              src="/profile4.png"
              alt=""
              draggable={false}
              className="w-full h-full object-contain object-center select-none"
              style={{
                filter: "grayscale(0.15) contrast(1.08) saturate(1)",
                maskImage:
                  "radial-gradient(ellipse at center, black 60%, transparent 95%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at center, black 60%, transparent 95%)",
              }}
            />
            <div
              className="absolute inset-0 mix-blend-overlay"
              style={{
                background:
                  "radial-gradient(60% 50% at 30% 30%, rgba(34,211,238,0.3), transparent 70%), radial-gradient(60% 50% at 80% 70%, rgba(139,92,246,0.3), transparent 70%)",
              }}
            />
          </div>
        </motion.div>

        {/* === Content ================================================== */}
        <div
          className="relative mx-auto max-w-7xl w-full px-5 md:px-6"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Decorative vertical rail — desktop only */}
          <motion.div
            aria-hidden
            style={{ scaleY: railScaleY, opacity: railOpacity, transformOrigin: "top" }}
            className="hidden md:block absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/0 via-neon-cyan/60 to-neon-violet/0 pointer-events-none"
          />

          {/* Eyebrow */}
          <motion.div
            style={{
              y: eyebrowY,
              opacity: eyebrowOpacity,
              rotateX: eyebrowRotateX,
              transformStyle: "preserve-3d",
            }}
            className="font-mono text-[10px] md:text-xs tracking-[0.35em] md:tracking-[0.45em] uppercase text-neon-cyan"
          >
            01 · About
          </motion.div>

          {/* Heading */}
          <motion.h2
            style={{
              y: headingY,
              opacity: headingOpacity,
              rotateX: headingRotateX,
              scale: headingScale,
              filter: headingBlur,
              transformStyle: "preserve-3d",
            }}
            className="mt-3 md:mt-4 font-display text-[2rem] sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-4xl"
          >
            I treat code like cinema —{" "}
            <span className="text-ink-dim">every detail set on purpose.</span>
          </motion.h2>

          {/* Paragraph */}
          <motion.p
            style={{
              x: paraX,
              opacity: paraOpacity,
              rotateY: paraRotateY,
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
            }}
            className="mt-5 md:mt-8 text-ink-dim text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl"
          >
            I'm a Full-Stack Developer based in Kerala, India. I've spent the
            last four years building scalable React/Next.js apps and Node
            services — and lately, AI-augmented products powered by OpenAI and
            custom RAG pipelines. Athion AI, the assistant on this site, is
            one of them.
          </motion.p>

          {/* Stats grid */}
          <div className="mt-8 md:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl">
            {STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} dir={STAT_DIRS[i]} progress={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * StatCard — own scroll-mapped 3D entry/exit
 * ========================================================================= */
function StatCard({ stat, dir, progress, index }) {
  const startEnter = 0.08 + index * 0.03;
  const finishEnter = 0.36 + index * 0.025;
  const startExit = 0.66 - index * 0.015;
  const finishExit = 0.96 - index * 0.01;

  const x = useTransform(
    progress,
    [0, finishEnter, startExit, 1],
    [dir.fromX, "0vw", "0vw", dir.toX],
  );
  const y = useTransform(
    progress,
    [0, finishEnter, startExit, 1],
    [dir.fromY, "0vh", "0vh", dir.toY],
  );
  const rotateZ = useTransform(
    progress,
    [0, finishEnter, startExit, 1],
    [dir.fromRot, 0, 0, dir.toRot],
  );
  const rotateY = useTransform(
    progress,
    [0, finishEnter, startExit, 1],
    [index % 2 === 0 ? -26 : 26, 0, 0, index % 2 === 0 ? 26 : -26],
  );
  const scale = useTransform(
    progress,
    [0, finishEnter, startExit, 1],
    [0.62, 1, 1, 0.7],
  );
  const opacity = useTransform(
    progress,
    [startEnter, finishEnter, startExit, finishExit],
    [0, 1, 1, 0],
  );
  const blur = useTransform(progress, [0, finishEnter, startExit, 1], [
    "blur(14px)",
    "blur(0px)",
    "blur(0px)",
    "blur(12px)",
  ]);

  return (
    <motion.div
      style={{
        x,
        y,
        rotateZ,
        rotateY,
        scale,
        opacity,
        filter: blur,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ y: -6, scale: 1.04 }}
      className="glass rounded-xl md:rounded-2xl p-3.5 md:p-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none"
           style={{
             background:
               "radial-gradient(80% 60% at 0% 0%, rgba(34,211,238,0.20), transparent 70%)",
           }}
      />
      <div className="font-mono text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.35em] uppercase text-ink-mute mb-1.5 md:mb-2">
        0{index + 1}
      </div>
      <div className="font-display text-xl md:text-3xl font-semibold text-gradient leading-tight break-words">
        {stat.value}
      </div>
      <div className="mt-1 text-[10px] md:text-xs uppercase tracking-wider md:tracking-widest text-ink-mute">
        {stat.label}
      </div>
    </motion.div>
  );
}
