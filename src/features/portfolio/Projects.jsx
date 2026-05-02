import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
} from "framer-motion";
import { useProjectStore } from "@/store";
import { cn } from "@/utils/cn";

/**
 * Projects / "03 · Selected work" — cinematic archive.
 *
 *   Background is `profile3.png` treated as a holographic subject under
 *   inspection: chromatic ghosts, scanlines, scan bar, mouse-tracked tilt,
 *   surrounded by a neural-net field, HUD frame and floating telemetry.
 *
 *   Each card has its OWN scroll progress (via useScroll on its ref) so it
 *   enters / rests / exits in sync with where it is on the page:
 *     · Even-index cards glide in from the LEFT with a -22° Y-tilt and
 *       z-depth recede; exit slightly to the right.
 *     · Odd-index cards mirror that — glide in from the RIGHT.
 *   Hover adds a 3D mouse tilt on top (nested transform).
 *
 *   Mobile (< md) drops the dramatic horizontal/3D entry for a clean
 *   fade-rise; portrait shrinks and dims so the stacked cards stay legible.
 */

const easeIO = cubicBezier(0.65, 0, 0.35, 1);
const stillEase = cubicBezier(0.4, 0, 0.6, 1);

export function Projects() {
  const projects = useProjectStore((s) => s.projects);
  const sectionRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Mouse position (-0.5 .. 0.5) for portrait & neural-field parallax.
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

  // Section-level scroll progress drives the sticky background choreography.
  // Light spring keeps the bg parallax smooth without adding noticeable
  // scroll lag — heavier springs were making the section feel stuck.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 36,
    mass: 0.25,
  });

  return (
    <section
      ref={sectionRef}
      id="projects"
      onMouseMove={isMobile ? undefined : onMouseMove}
      onMouseLeave={isMobile ? undefined : onMouseLeave}
      className="relative overflow-hidden"
      style={{ perspective: isMobile ? "none" : 1600 }}
    >
      {/* === Background — sticky on desktop, plain absolute on mobile.
            Mobile drops the sticky+negative-margin pattern (which is the
            biggest source of layout jank on phones, especially with svh
            changing as the URL bar shows/hides) for a cheap absolute bg. */}
      <div
        className={cn(
          "w-full overflow-hidden -z-10 pointer-events-none",
          isMobile
            ? "absolute inset-0"
            : "sticky top-0 h-[100svh]",
        )}
      >
        <AmbientBg progress={p} />
        {!isMobile && <NeuralField mx={mx} my={my} />}
        <HoloHalo progress={p} isMobile={isMobile} />
        <HoloPortrait progress={p} mx={mx} my={my} isMobile={isMobile} />
        <ScanSweep />
        <ParticleField />
        <Vignette />
        {!isMobile && <HudFrame progress={p} mx={mx} my={my} />}
        {!isMobile && <DataReadouts progress={p} total={projects.length} />}
      </div>

      {/* === Content === */}
      <div
        className={cn(
          "relative",
          isMobile
            ? "pt-16 pb-20"
            : "-mt-[100svh] pt-36 pb-40",
        )}
      >
        <div className="mx-auto max-w-7xl px-5 md:px-6">
          <ProjectsHeading />
          <div
            className="mt-8 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            style={isMobile ? undefined : { perspective: 1400 }}
          >
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                total={projects.length}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
 * ScrollTypewriter — reveals (and unreveals) text by scroll progress.
 *
 *   `parts` accepts either a plain string or an array of `{ text, className }`
 *   so the title can have its second word ("shipped.") rendered with the
 *   gradient class while still typing one character at a time across the
 *   whole sentence.
 *
 *   `enterRange` defines the [from, to] progress band where the text types
 *   IN; `exitRange` defines where it erases OUT. Between them the text
 *   stays fully revealed; outside both, it's invisible.
 * ========================================================================= */
function ScrollTypewriter({
  parts,
  progress,
  enterRange = [0.05, 0.30],
  exitRange = [0.70, 0.95],
  className,
  cursor = true,
}) {
  const segments = Array.isArray(parts) ? parts : [{ text: parts }];
  const total = segments.reduce((sum, s) => sum + s.text.length, 0);

  const compute = (v) => {
    if (v <= enterRange[0]) return 0;
    if (v < enterRange[1]) {
      const t = (v - enterRange[0]) / (enterRange[1] - enterRange[0]);
      return Math.round(t * total);
    }
    if (v < exitRange[0]) return total;
    if (v < exitRange[1]) {
      const t = (v - exitRange[0]) / (exitRange[1] - exitRange[0]);
      return Math.round((1 - t) * total);
    }
    return 0;
  };

  // Seed `shown` from the current progress so direct-nav lands on the
  // correct character count instead of flashing empty until the first event.
  const [shown, setShown] = useState(() => compute(progress.get()));
  useMotionValueEvent(progress, "change", (v) => {
    const n = compute(v);
    setShown((prev) => (prev !== n ? n : prev));
  });

  let remaining = shown;
  const rendered = segments.map((seg, i) => {
    const sliceLen = Math.min(remaining, seg.text.length);
    remaining -= sliceLen;
    return (
      <span key={i} className={seg.className || ""}>
        {seg.text.slice(0, sliceLen)}
      </span>
    );
  });

  return (
    <span className={className}>
      {rendered}
      {cursor && shown < total && (
        <span
          aria-hidden
          className="inline-block w-[0.06em] h-[0.85em] -mb-[0.08em] bg-current animate-pulse ml-[0.04em]"
        />
      )}
    </span>
  );
}

/* =========================================================================
 * Heading — eyebrow + title type IN as the heading scrolls into view and
 * type OUT as it scrolls past, plus a whileInView paragraph beneath.
 * ========================================================================= */
function ProjectsHeading() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Tight spring — progress closely tracks scroll so the typewriter
  // doesn't lag behind the user. Lower mass, higher stiffness.
  const p = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 34,
    mass: 0.2,
  });

  return (
    <div ref={ref} className="relative">
      <div className="font-mono text-[10px] md:text-xs tracking-[0.35em] md:tracking-[0.45em] uppercase text-neon-pink flex items-center gap-2">
        <span className="block w-6 h-px bg-neon-pink" />
        <ScrollTypewriter
          parts="03 · Selected work"
          progress={p}
          enterRange={[0.06, 0.26]}
          exitRange={[0.74, 0.94]}
        />
      </div>
      <h2 className="mt-2 md:mt-4 font-display text-[1.7rem] sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] min-h-[1em]">
        <ScrollTypewriter
          parts={[
            { text: "Things I've " },
            { text: "shipped.", className: "text-gradient" },
          ]}
          progress={p}
          enterRange={[0.16, 0.44]}
          exitRange={[0.62, 0.90]}
        />
      </h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: easeIO, delay: 0.4 }}
        className="mt-3 md:mt-6 max-w-xl text-ink-dim text-sm md:text-base leading-relaxed"
      >
        Real production work — full-stack apps, AI integrations, and SEO sites
        — distilled into the projects that taught me the most.
      </motion.p>
    </div>
  );
}

/* =========================================================================
 * ProjectCard — desktop: scroll-driven side-glide + mouse tilt.
 *               mobile : whileInView fade-rise (no scroll subscription).
 *
 * The earlier version stacked a per-card useSpring on top of Lenis-smoothed
 * scroll, which made the page feel "stuck" because every card ran its own
 * critically-damped spring solve every frame, and on top of that we were
 * animating filter:blur (very expensive on the GPU). Both removed here.
 * ========================================================================= */
function ProjectCard({ project, index, total, isMobile }) {
  const ref = useRef(null);

  // Per-card scroll progress drives a 3D parallax tumble entry+exit:
  //   below viewport → far away (z: -300), tilted back (rotateX: -22), with a
  //                    mirrored rotateY tumble (left col leans one way, right
  //                    col the other), scaled down, faded out
  //   centred       → flat at z=0, rotated 0, scale 1, opacity 1
  //   above viewport→ recedes back (z: -200), tilts forward (rotateX: 14)
  //                    and the mirrored rotateY un-tumbles the other way
  //
  // Critically: NO x translate — that's what was throwing cards out of the
  // grid. rotateY at ±12° doesn't shift column center; it just makes the
  // card's near edge appear to come forward.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Even cards (left column) tumble one way, odd cards mirror it.
  const dir = index % 2 === 0 ? -1 : 1;

  const yDesktop = useTransform(
    scrollYProgress,
    [0, 0.30, 0.70, 1],
    [70, 0, 0, -60],
    { ease: easeIO },
  );
  const opacityDesktop = useTransform(
    scrollYProgress,
    [0, 0.22, 0.85, 1],
    [0, 1, 1, 0],
  );
  const scaleDesktop = useTransform(
    scrollYProgress,
    [0, 0.30, 0.70, 1],
    [0.84, 1, 1, 0.92],
    { ease: easeIO },
  );
  const zDesktop = useTransform(
    scrollYProgress,
    [0, 0.30, 0.70, 1],
    [-300, 0, 0, -200],
    { ease: easeIO },
  );
  const rotateXDesktop = useTransform(
    scrollYProgress,
    [0, 0.30, 0.70, 1],
    [-22, 0, 0, 14],
    { ease: easeIO },
  );
  const rotateYDesktop = useTransform(
    scrollYProgress,
    [0, 0.30, 0.70, 1],
    [dir * -12, 0, 0, dir * 8],
    { ease: easeIO },
  );

  const yMobile = useTransform(
    scrollYProgress,
    [0, 0.25, 0.85, 1],
    [40, 0, 0, -32],
    { ease: easeIO },
  );
  const opacityMobile = useTransform(
    scrollYProgress,
    [0, 0.22, 0.92, 1],
    [0, 1, 1, 0],
  );
  const scaleMobile = useTransform(
    scrollYProgress,
    [0, 0.25, 0.85, 1],
    [0.94, 1, 1, 0.97],
    { ease: easeIO },
  );

  const scrollStyle = isMobile
    ? { y: yMobile, opacity: opacityMobile, scale: scaleMobile }
    : {
        y: yDesktop,
        opacity: opacityDesktop,
        scale: scaleDesktop,
        z: zDesktop,
        rotateX: rotateXDesktop,
        rotateY: rotateYDesktop,
      };

  // === Mouse tilt (hover, desktop only) ===============================
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const stx = useSpring(tx, { stiffness: 220, damping: 22 });
  const sty = useSpring(ty, { stiffness: 220, damping: 22 });
  const rotateXTilt = useTransform(sty, [-60, 60], [9, -9]);
  const rotateYTilt = useTransform(stx, [-60, 60], [-9, 9]);

  const onMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    tx.set(e.clientX - rect.left - rect.width / 2);
    ty.set(e.clientY - rect.top - rect.height / 2);
  };
  const onMouseLeave = () => {
    tx.set(0);
    ty.set(0);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={isMobile ? undefined : onMouseMove}
      onMouseLeave={isMobile ? undefined : onMouseLeave}
      style={{ ...scrollStyle, transformStyle: "preserve-3d" }}
      className="group relative rounded-2xl cursor-default"
      data-cursor="hover"
    >
      <motion.div
        style={{
          rotateX: isMobile ? 0 : rotateXTilt,
          rotateY: isMobile ? 0 : rotateYTilt,
          transformStyle: "preserve-3d",
        }}
        className="relative glass rounded-2xl p-5 md:p-8 overflow-hidden h-full"
      >
        {/* Hover accent halo */}
        <div
          aria-hidden
          className={cn(
            "absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700 bg-gradient-to-br pointer-events-none",
            project.accent,
          )}
        />
        {/* Subtle accent bloom in the corner */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 opacity-30 pointer-events-none bg-gradient-to-br rounded-2xl",
            project.accent,
          )}
          style={{
            maskImage:
              "radial-gradient(60% 50% at 0% 0%, #000, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(60% 50% at 0% 0%, #000, transparent 70%)",
          }}
        />

        <div className="relative" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.3em] text-ink-mute">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-gradient-to-br shadow-neon",
                project.accent,
              )}
            />
          </div>
          <h3 className="mt-3 md:mt-4 font-display text-xl md:text-3xl font-semibold tracking-tight">
            {project.title}
          </h3>
          <p className="mt-2 md:mt-3 text-ink-dim text-sm md:text-base leading-relaxed">
            {project.summary}
          </p>
          <div className="mt-4 md:mt-6 flex flex-wrap gap-1.5 md:gap-2">
            {project.stack.map((t) => (
              <span
                key={t}
                className="inline-flex rounded-md border border-white/10 bg-black/30 px-2 py-0.5 md:py-1 text-[10px] md:text-[11px] text-ink-dim group-hover:border-neon-pink/40 group-hover:text-ink transition"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* HUD label */}
        <div className="absolute top-3 right-3 font-mono text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-ink-mute pointer-events-none">
          // PROJECT
        </div>
      </motion.div>
    </motion.article>
  );
}

/* =========================================================================
 * Background layers — pink-accented variant of the Skills cinematic stack.
 * ========================================================================= */
function AmbientBg({ progress }) {
  const y = useTransform(progress, [0, 1], ["-6%", "6%"]);
  const opacity = useTransform(progress, [0, 0.18, 0.82, 1], [0, 1, 1, 0]);
  return (
    <motion.div style={{ y, opacity }} className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 600px at 50% 30%, rgba(244,114,182,0.14), transparent 70%), radial-gradient(700px 500px at 50% 90%, rgba(34,211,238,0.10), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-25" />
    </motion.div>
  );
}

function HoloHalo({ progress, isMobile }) {
  const opacity = useTransform(progress, [0, 0.2, 0.78, 1], [0, 1, 1, 0]);
  const scrollScale = useTransform(progress, [0, 0.5, 1], [0.9, 1, 1.06], {
    ease: stillEase,
  });
  return (
    <motion.div
      style={{ opacity, scale: scrollScale }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2",
        isMobile ? "top-[14%]" : "top-1/2 -translate-y-1/2",
      )}
    >
      <motion.div
        className="rounded-full"
        style={{
          width: "min(95vw, 760px)",
          height: "min(95vw, 760px)",
          background:
            "radial-gradient(closest-side, rgba(244,114,182,0.22), rgba(139,92,246,0.12) 45%, transparent 72%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function HoloPortrait({ progress, mx, my, isMobile }) {
  const tiltY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 80,
    damping: 22,
  });
  const tiltX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 80,
    damping: 22,
  });

  const scrollScale = useTransform(progress, [0, 0.5, 1], [1.18, 1, 1.05], {
    ease: stillEase,
  });
  const scrollY = useTransform(progress, [0, 1], ["12%", "-12%"]);

  // Cinematic horizontal entry — slides in from the far right and back out.
  const xEntryDesktop = useTransform(
    progress,
    [0, 0.2, 0.8, 1],
    ["55%", "0%", "0%", "55%"],
    { ease: easeIO },
  );
  const xEntryMobile = useTransform(progress, [0, 1], ["0%", "0%"]);
  const xEntry = isMobile ? xEntryMobile : xEntryDesktop;

  const opacityDesktop = useTransform(
    progress,
    [0, 0.15, 0.5, 0.85, 1],
    [0, 0.42, 0.48, 0.42, 0],
    { ease: stillEase },
  );
  const opacityMobile = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    [0, 0.12, 0.16, 0.12, 0],
    { ease: stillEase },
  );
  const opacity = isMobile ? opacityMobile : opacityDesktop;

  const blur = useTransform(
    progress,
    [0, 0.22, 0.78, 1],
    ["blur(12px)", "blur(0px)", "blur(0px)", "blur(10px)"],
  );

  const splitMax = isMobile ? 8 : 18;
  const cyanX = useTransform(
    progress,
    [0, 0.25, 0.5, 0.75, 1],
    [-splitMax, -2, 0, 2, splitMax],
  );
  const violetX = useTransform(cyanX, (v) => -v);

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        isMobile
          ? "left-1/2 -translate-x-1/2 top-[14%]"
          : "right-0 top-1/2 -translate-y-1/2 translate-x-[14%]",
      )}
    >
      <motion.div
        style={{
          x: xEntry,
          y: scrollY,
          scale: scrollScale,
          opacity,
          filter: blur,
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: "preserve-3d",
          transformPerspective: 1400,
        }}
        className="select-none"
      >
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div
            className="relative"
            style={{
              height: isMobile
                ? "clamp(240px, 44svh, 380px)"
                : "clamp(460px, 92svh, 920px)",
              width: isMobile ? "min(58vw, 240px)" : "min(95vw, 720px)",
            }}
          >
            {/* Chromatic ghosts — desktop only. On mobile they're invisible
                anyway at 16% opacity but still render 2 extra images. */}
            {!isMobile && (
              <>
                <motion.img
                  src="/profile3.png"
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
                <motion.img
                  src="/profile3.png"
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
              </>
            )}

            {/* Main subject */}
            <img
              src="/profile3.png"
              alt=""
              aria-hidden
              draggable={false}
              style={{ filter: "contrast(1.05) brightness(0.95)" }}
              className="relative w-full h-full object-contain"
            />

            {/* Heavy holo treatments — scanlines, scan bar, grain, pulse
                rings, orbiting orbs — desktop only. Mobile keeps only the
                main image so the section stays smooth on phones. */}
            {!isMobile && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(244,114,182,0.18) 0px, rgba(244,114,182,0.18) 1px, transparent 1px, transparent 3px)",
                  }}
                />
                <motion.div
                  className="absolute left-0 right-0 h-20 mix-blend-screen pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(244,114,182,0.55), transparent)",
                    filter: "blur(2px)",
                  }}
                  animate={{ top: ["-15%", "115%"] }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.4,
                  }}
                />
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
                    backgroundSize: "3px 3px",
                  }}
                />
                <PulseRings />
                <OrbitingOrbs />
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* PulseRings — three concentric pink rings expanding outward from the
 * portrait centre on staggered loops. Lives inside the portrait wrapper so
 * it follows the portrait's position, scale and tilt automatically. */
function PulseRings() {
  const rings = [0, 1.4, 2.8];
  return (
    <>
      {rings.map((delay, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "62%",
            height: "62%",
            marginLeft: "-31%",
            marginTop: "-31%",
            borderRadius: "9999px",
            border: "1px solid rgba(244,114,182,0.45)",
            pointerEvents: "none",
          }}
          animate={{ scale: [0.5, 1.9], opacity: [0.55, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

/* OrbitingOrbs — three glowing orbs orbiting the portrait at different
 * radii, speeds and directions. Sized in vmin so they scale with the
 * viewport without breaking the parent layout. */
function OrbitingOrbs() {
  const orbits = [
    { size: 58, dur: 18, color: "#f472b6", dir: 1, delay: 0 },
    { size: 74, dur: 26, color: "#8b5cf6", dir: -1, delay: 0.6 },
    { size: 92, dur: 34, color: "#22d3ee", dir: 1, delay: 1.2 },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        pointerEvents: "none",
      }}
    >
      {orbits.map((o, i) => {
        const sz = `${o.size}vmin`;
        return (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: sz,
              height: sz,
              left: `calc(-${sz} / 2)`,
              top: `calc(-${sz} / 2)`,
            }}
            animate={{ rotate: o.dir * 360 }}
            transition={{
              duration: o.dur,
              repeat: Infinity,
              ease: "linear",
              delay: o.delay,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
                borderRadius: "9999px",
                backgroundColor: o.color,
                boxShadow: `0 0 14px ${o.color}, 0 0 28px ${o.color}`,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

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
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[14%] hidden md:block">
      <motion.div
        style={{ x: px, y: py, opacity, scale: enterScale }}
      >
      <div
        className="relative"
        style={{
          width: "min(92vw, 690px)",
          height: "clamp(440px, 88svh, 880px)",
        }}
      >
        <span className="absolute -top-1 -left-1 w-9 h-9 border-l-2 border-t-2 border-neon-pink/80" />
        <span className="absolute -top-1 -right-1 w-9 h-9 border-r-2 border-t-2 border-neon-pink/80" />
        <span className="absolute -bottom-1 -left-1 w-9 h-9 border-l-2 border-b-2 border-neon-pink/80" />
        <span className="absolute -bottom-1 -right-1 w-9 h-9 border-r-2 border-b-2 border-neon-pink/80" />

        <div className="absolute -top-6 left-10 font-mono text-[10px] tracking-[0.4em] uppercase text-neon-pink/80">
          archive :: live
        </div>
        <div className="absolute -bottom-6 right-10 font-mono text-[10px] tracking-[0.4em] uppercase text-neon-pink/60">
          ◢ render 100%
        </div>

        <motion.div
          className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative size-32 rounded-full border border-neon-pink/40">
            <div className="absolute inset-4 rounded-full border border-neon-pink/30" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 w-px h-3 bg-neon-pink/80" />
            <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-px h-3 bg-neon-pink/80" />
            <span className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-px bg-neon-pink/80" />
            <span className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-px bg-neon-pink/80" />
          </div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 size-32 rounded-full border border-neon-pink/60"
          animate={{ scale: [1, 2.2], opacity: [0.55, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />
      </div>
      </motion.div>
    </div>
  );
}

function DataReadouts({ progress, total }) {
  const opacity = useTransform(progress, [0.15, 0.32, 0.7, 0.9], [0, 1, 1, 0]);
  const padded = String(total).padStart(2, "0");

  const items = [
    {
      pos: "top-[12%] left-[5%]",
      color: "text-neon-pink/80",
      lines: ["> ARCHIVE_OPEN", `PROJECTS ${padded}/${padded}`],
    },
    {
      pos: "top-[16%] right-[5%]",
      color: "text-neon-cyan/80",
      lines: ["RUNTIME ▮▮▮▮▮", "STATUS :: SHIPPED"],
    },
    {
      pos: "bottom-[20%] left-[5%]",
      color: "text-neon-violet/80",
      lines: ["BUILD :: PASS", "TESTS :: GREEN"],
    },
    {
      pos: "bottom-[24%] right-[5%]",
      color: "text-neon-lime/80",
      lines: ["DEPLOY ◆ NOMINAL", "UPTIME :: 99.99%"],
    },
  ];

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 hidden lg:block"
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
      className="absolute inset-0 hidden sm:block"
    >
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {lines.map((ln, i) => (
          <motion.line
            key={`l-${i}`}
            x1={`${ln.a.x}%`}
            y1={`${ln.a.y}%`}
            x2={`${ln.b.x}%`}
            y2={`${ln.b.y}%`}
            stroke="rgba(244,114,182,0.18)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.05, 0.4, 0.1, 0.35] }}
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
          className="absolute size-1.5 rounded-full bg-neon-pink -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            boxShadow: "0 0 8px rgba(244,114,182,0.85)",
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

function ScanSweep() {
  return (
    <motion.div
      aria-hidden
      className="absolute left-0 right-0 h-32 mix-blend-screen pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(244,114,182,0) 30%, rgba(244,114,182,0.18) 50%, rgba(244,114,182,0) 70%, transparent 100%)",
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
          className="absolute rounded-full bg-neon-pink/50"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            boxShadow: "0 0 6px rgba(244,114,182,0.65)",
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

function Vignette() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(72% 60% at 50% 50%, rgba(5,6,10,0.0) 0%, rgba(5,6,10,0.55) 60%, rgba(5,6,10,0.88) 100%)",
      }}
    />
  );
}
