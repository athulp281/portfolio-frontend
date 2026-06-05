import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  Server,
  Database,
  Network,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { SiOpenai, SiClaude, SiGooglegemini } from "react-icons/si";
import { Magnetic } from "@/components/common/Magnetic";
import { Marquee } from "@/components/common/Marquee";
import { useBootStore } from "@/store";

const easing = [0.16, 1, 0.3, 1];
// Smooth, symmetric ease for the scroll-driven card motion.
const easeInOut = cubicBezier(0.65, 0, 0.35, 1);
const easeOut = cubicBezier(0.16, 1, 0.3, 1);

const MARQUEE = [
  "Development",
  "Design",
  "Frontend",
  "Backend",
  "AI Engineering",
  "Interfaces",
];

const CHIPS = [
  "React",
  "Next.js",
  "Node.js",
  "OpenAI",
  "RAG",
  "TypeScript",
  "Tailwind",
  "Three.js",
];

// The single image shown (full) inside the big landscape card, then sliced
// across the three panels. Swap to a wide landscape shot for an edge-to-edge
// fill; a portrait (current) is letterboxed via object-contain so it shows
// in full rather than cropping to the head.
const HERO_IMAGE = "/profile2.jpeg";

// Back-face content per panel (revealed after the flip). Center is highlighted.
// Each card shows a row of icons + title + description.
const CARDS = [
  {
    title: "Next-Gen Development & AI-Augmented Coding",
    desc: "Building with frontier LLMs — OpenAI, Claude and Gemini — wired into real workflows.",
    icons: [SiOpenai, SiClaude, SiGooglegemini],
    tone: "dark",
    fan: -12,
    rotEnd: -9, // final tilt on the rainbow arc
    yEnd: 6, // final drop (vh) — sides sit lower than the centre
  },
  {
    title: "Scalable Architecture & Production Systems",
    desc: "Typed APIs, data layers and infrastructure that scale reliably in production.",
    icons: [Server, Database, Network],
    tone: "light",
    fan: 0,
    rotEnd: 0,
    yEnd: -3, // centre sits highest (top of the arc)
  },
  {
    title: "Business Impact & Automation",
    desc: "Turning manual workflows into automated, measurable business outcomes.",
    icons: [TrendingUp, Workflow, Zap],
    tone: "dark",
    fan: 12,
    rotEnd: 9,
    yEnd: 6,
  },
];

// Big landscape card geometry, measured in px so it stays centered and fully
// on-screen. The card is wide (≈ full content width); height derives from a
// landscape ratio and is capped so the whole card fits the viewport. Each
// panel is a third of the width.
function computeDims() {
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const small = vw < 768;
  // Squarer/taller card on phones so the three panels aren't tiny slivers.
  const ratio = small ? 1.3 : 2.15;
  let W = Math.min(vw * (small ? 0.94 : 0.9), 1320);
  let H = W / ratio;
  const maxH = vh * (small ? 0.46 : 0.6);
  if (H > maxH) {
    H = maxH;
    W = H * ratio;
  }
  return { H, W, panelW: W / 3, small };
}

const GAP = 36; // px the panels separate by when split

export function LandingHero() {
  // Same cinematic split/flip hero on every screen (responsive geometry).
  return <HeroStage />;
}

/* ========================================================================= */
function HeroStage() {
  const sectionRef = useRef(null);
  const ready = useBootStore((s) => s.ready);
  const [go, setGo] = useState(false);
  const [dims, setDims] = useState(computeDims);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGo(true), 80);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    const onResize = () => setDims(computeDims());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Heavily-damped spring → consistent, smooth glide regardless of how fast
  // or slow you scroll (more mass + damping absorbs velocity spikes).
  const p = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 34,
    mass: 0.9,
  });

  // Phase 0 — the big card starts lower (peeking) while the marquee + intro
  // fill the screen, then rises to centre. On mobile it starts a bit higher
  // (closer to centre) so it reads better on first view.
  const cardsY = useTransform(p, [0, 0.2], [dims.small ? "16vh" : "32vh", "0vh"]);
  const topOpacity = useTransform(p, [0.08, 0.24], [1, 0]);
  const topY = useTransform(p, [0, 0.24], ["0vh", "-5vh"]);
  const nameOpacity = useTransform(p, [0.32, 0.54], [0, 1]);
  const nameScale = useTransform(p, [0.32, 0.58], [0.92, 1]);
  const cueOpacity = useTransform(p, [0, 0.05], [1, 0]);

  return (
    <section ref={sectionRef} id="hero" className="relative h-[380svh]">
      <div
        className="sticky top-0 h-[100svh] overflow-hidden"
        style={{ perspective: 2200 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 18%, rgba(34,211,238,0.10), transparent 70%), radial-gradient(50% 50% at 10% 90%, rgba(139,92,246,0.08), transparent 70%)",
          }}
        />

        {/* Top zone: word-marquee + intro row */}
        <motion.div
          style={{ opacity: topOpacity, y: topY }}
          className="absolute top-0 inset-x-0 z-10"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={go ? { opacity: 1 } : {}}
            transition={{ duration: 1, ease: easing }}
            className="pt-[68px]"
          >
            <Marquee
              items={MARQUEE}
              speed={52}
              itemClassName="font-display font-medium text-[clamp(4rem,10vw,10rem)] tracking-[-0.02em] text-ink/25 whitespace-nowrap leading-none"
              separatorClassName="text-ink/15 text-[clamp(2rem,5vw,5rem)]"
            />
          </motion.div>

          <div className="mx-auto max-w-7xl px-6 md:px-10 mt-4 md:mt-6 flex items-start justify-between gap-6 md:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={go ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: easing, delay: 0.25 }}
              className="max-w-xs"
            >
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-dim">
                <span className="size-1.5 rounded-full bg-neon-lime shadow-[0_0_10px_#a3e635]" />
                Available for work
              </div>
              <p className="mt-3 text-ink-dim text-sm leading-relaxed">
                Full-stack developer building AI-native, user-first products.
              </p>
              <Magnetic strength={0.3}>
                <Link
                  to="/chat"
                  data-cursor="hover"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-ink hover:text-neon-cyan transition-colors border-b border-line/20 hover:border-neon-cyan/60 pb-1"
                >
                  Talk with my AI
                  <ArrowUpRight className="size-4" />
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={go ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: easing, delay: 0.35 }}
              className="hidden sm:flex max-w-sm flex-wrap justify-end gap-2"
            >
              {CHIPS.map((c) => (
                <span
                  key={c}
                  className="inline-flex rounded-full border border-line/15 px-3 py-1.5 text-xs text-ink-dim"
                >
                  {c}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Giant name behind the cards */}
        <motion.h1
          style={{ opacity: nameOpacity, scale: nameScale }}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
        >
          <span className="font-display font-semibold tracking-[-0.04em] text-ink text-[clamp(4rem,15vw,14rem)] leading-none whitespace-nowrap">
            Athul&nbsp;P
          </span>
        </motion.h1>

        {/* Big landscape card → split → fan → flip.
            Centering lives on the plain wrapper divs (NOT on the animated
            card) — framer-motion owns `transform` on the card, so any Tailwind
            translate there would be overwritten and knock it off-centre. */}
        <motion.div
          style={{ y: cardsY }}
          className="absolute inset-0 z-20 grid place-items-center"
        >
          <div className="relative" style={{ transformStyle: "preserve-3d" }}>
            {CARDS.map((card, i) => (
              <div
                key={card.title}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: i === 1 ? 30 : 20 - i }}
              >
                <SplitCard card={card} index={i} p={p} go={go} dims={dims} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          style={{ opacity: cueOpacity }}
          initial={{ opacity: 0 }}
          animate={go ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1, ease: easing }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute"
        >
          <ArrowDown className="size-3.5 animate-float" />
          Scroll
        </motion.div>
      </div>
    </section>
  );
}

function SplitCard({ card, index, p, go, dims }) {
  const isCenter = index === 1;
  const { H, W, panelW, small } = dims;

  // At rest the three panels sit edge-to-edge (forming the one big card);
  // on scroll they separate by GAP.
  const restX = (index - 1) * panelW;
  const apartX = (index - 1) * (panelW + GAP);
  // Phases run after the card has risen to centre (~0.2). Each is eased and
  // spread over a wide scroll band so the motion glides rather than snaps.
  const x = useTransform(p, [0.22, 0.46], [restX, apartX], { ease: easeOut });
  // Scatter to the peak fan, then settle onto the rainbow arc tilt (not 0).
  const rotateZ = useTransform(p, [0.42, 0.6, 0.9], [0, card.fan, card.rotEnd], {
    ease: [easeInOut, easeInOut],
  });
  // Vertical arc — sides drop below the centre so the trio curves like a
  // rainbow rather than sitting in a straight line.
  const yArc = useTransform(p, [0.58, 0.9], ["0vh", `${card.yEnd}vh`], {
    ease: easeInOut,
  });
  // Flip to reveal content — the widest band so the rotation reads smoothly.
  const rotateY = useTransform(p, [0.58, 0.9], [0, 180], { ease: easeInOut });
  const scale = useTransform(p, [0.58, 0.9], [1, isCenter ? 1.06 : 0.98], {
    ease: easeInOut,
  });

  return (
    <motion.div
      style={{ x, rotateZ }}
      initial={{ opacity: 0, y: 50 }}
      animate={go ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: easing, delay: 0.35 + index * 0.08 }}
      className="relative"
    >
      <motion.div
        style={{
          width: panelW,
          height: H,
          y: yArc,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* FRONT — this panel's window onto the full (contained) image */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-line/10 shadow-glass"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background:
              "radial-gradient(120% 100% at 50% 0%, rgba(34,211,238,0.12), transparent 55%), radial-gradient(120% 100% at 50% 100%, rgba(139,92,246,0.12), transparent 55%), #0a0d14",
          }}
        >
          <img
            src={HERO_IMAGE}
            alt={isCenter ? "Athul P" : ""}
            aria-hidden={!isCenter}
            draggable={false}
            className="h-full max-w-none object-contain object-center"
            style={{ width: W, marginLeft: -(index * panelW), filter: "contrast(1.04)" }}
          />
        </div>

        {/* BACK — capability content card (compact on the narrow mobile panels) */}
        <div
          className="absolute inset-0 rounded-2xl border p-3 md:p-6 flex flex-col justify-between"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: card.tone === "light" ? "#e6e9f2" : "#0a0d14",
            borderColor:
              card.tone === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="flex items-center gap-2.5 md:gap-3.5"
            style={{ color: card.tone === "light" ? "#05060a" : "#22d3ee" }}
          >
            {card.icons.map((Ic, k) => (
              <Ic key={k} className="size-5 md:size-7" />
            ))}
          </div>
          <div>
            <h3
              className="font-display font-semibold text-[13px] md:text-xl leading-tight tracking-[-0.02em]"
              style={{ color: card.tone === "light" ? "#05060a" : "#e6e9f2" }}
            >
              {card.title}
            </h3>
            {!small && (
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: card.tone === "light" ? "#3a4254" : "#9aa3b8" }}
              >
                {card.desc}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

