import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wifi, Cpu } from "lucide-react";
import { ScanLines } from "@/components/common/ScanLines";

/**
 * Cinematic boot loader — a 3D identity card drops, bounces, splits into
 * front/back, floats briefly, then dissolves into the landing page.
 *
 * Stages (timing):
 *   drop:    0.00s → 1.40s   (gravity drop + rotation, spring bounce on land)
 *   split:   1.55s → 2.55s   (front/back open along Y axis)
 *   hover:   2.55s → 3.85s   (slow float + parallax breathe)
 *   exit:    3.85s → 4.85s   (scale up + blur + dissolve)
 *
 * Pure DOM + Framer Motion (no R3F) — keeps the loader light and snappy.
 */
const STAGES = {
  drop: 1400,
  splitDelay: 150,
  split: 1000,
  hover: 1300,
  exit: 1000,
};

export function IdentityLoader({ onDone }) {
  const [stage, setStage] = useState("drop"); // drop | split | hover | exit

  useEffect(() => {
    const t1 = setTimeout(() => setStage("split"), STAGES.drop + STAGES.splitDelay);
    const t2 = setTimeout(
      () => setStage("hover"),
      STAGES.drop + STAGES.splitDelay + STAGES.split,
    );
    const t3 = setTimeout(
      () => setStage("exit"),
      STAGES.drop + STAGES.splitDelay + STAGES.split + STAGES.hover,
    );
    const t4 = setTimeout(
      () => onDone?.(),
      STAGES.drop +
        STAGES.splitDelay +
        STAGES.split +
        STAGES.hover +
        STAGES.exit,
    );
    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [onDone]);

  // Deterministic floating particles (no jitter on rerender)
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        size: 1 + ((i * 13) % 3),
        delay: (i % 7) * 0.3,
        dur: 4 + (i % 5),
      })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[80] grid place-items-center bg-bg overflow-hidden"
    >
      {/* === Scene background ============================================ */}
      <div className="absolute inset-0 -z-10">
        {/* radial spotlight */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(800px 500px at 50% 60%, rgba(34,211,238,0.18), transparent 70%), radial-gradient(900px 600px at 50% 100%, rgba(139,92,246,0.15), transparent 70%)",
          }}
        />
        {/* grid */}
        <div className="absolute inset-0 grid-bg opacity-50" />
        {/* impact light flash on land */}
        <motion.div
          className="absolute inset-x-0 bottom-1/3 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #22d3ee, transparent)" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: stage === "drop" ? 0 : [0, 1, 0],
            opacity: stage === "drop" ? 0 : [0, 1, 0],
          }}
          transition={{ duration: 0.6, delay: 1.35 }}
        />
        {/* particles */}
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-neon-cyan/70"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              boxShadow: "0 0 8px rgba(34,211,238,0.7)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0.1, 0.7, 0.1],
              y: [-12, 12, -12],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* === Card stage =================================================== */}
      <div
        className="relative"
        style={{ perspective: 1400, perspectiveOrigin: "50% 30%" }}
      >
        {/* Floor reflection / shadow */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 top-[88%] w-[420px] h-10 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(8px)",
          }}
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{
            opacity: stage === "drop" ? [0, 0.0, 0.7] : 0.6,
            scaleX: stage === "drop" ? [0.4, 0.4, 1] : 1,
          }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* The container that handles the drop, hover and exit */}
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d", width: 360, height: 480 }}
          initial={{ y: -800, rotateZ: -18, rotateX: 18 }}
          animate={
            stage === "exit"
              ? {
                  y: 0,
                  rotateZ: 0,
                  rotateX: 0,
                  scale: 1.6,
                  opacity: 0,
                  filter: "blur(18px)",
                }
              : stage === "hover" || stage === "split"
                ? {
                    y: [0, -10, 0],
                    rotateZ: 0,
                    rotateX: 0,
                  }
                : { y: 0, rotateZ: 0, rotateX: 0 }
          }
          transition={
            stage === "drop"
              ? { type: "spring", stiffness: 90, damping: 11, mass: 1.3 }
              : stage === "exit"
                ? { duration: 1.0, ease: [0.6, 0, 0.4, 1] }
                : {
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    duration: 0.6,
                  }
          }
        >
          {/* FRONT side */}
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d", transformOrigin: "0% 50%" }}
            animate={
              stage === "split" || stage === "hover"
                ? { rotateY: -22, x: -28, z: 40 }
                : { rotateY: 0, x: 0, z: 0 }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <CardFront />
          </motion.div>

          {/* BACK side (initially flipped behind, animates around to be visible) */}
          <motion.div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "100% 50%",
              transform: "rotateY(180deg)",
            }}
            animate={
              stage === "split" || stage === "hover"
                ? { rotateY: 180 - 22, x: 28, z: 40 }
                : { rotateY: 180, x: 0, z: 0 }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <CardBack />
          </motion.div>
        </motion.div>
      </div>

      {/* Boot caption */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === "exit" ? 0 : 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-ink-mute">
          Initializing identity · {labelFor(stage)}
        </div>
        <div className="mt-2 mx-auto h-px w-40 bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"
            initial={{ x: "-100%" }}
            animate={{ x: stage === "exit" ? "0%" : ["-100%", "0%"] }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function labelFor(stage) {
  switch (stage) {
    case "drop":
      return "deploying card";
    case "split":
      return "verifying signature";
    case "hover":
      return "identity confirmed";
    case "exit":
      return "entering athion";
    default:
      return "...";
  }
}

function CardFront() {
  return (
    <div className="relative w-full h-full rounded-[28px] overflow-hidden glass neon-border shadow-neon"
         style={{ backfaceVisibility: "hidden" }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.04]" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <ScanLines intensity={0.35} />

      {/* header */}
      <div className="relative px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md grid place-items-center bg-gradient-to-br from-neon-cyan to-neon-violet text-bg shadow-neon">
            <span className="font-display text-[11px] font-bold">A</span>
          </div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-ink-dim">
            ATHION · ID
          </span>
        </div>
        <span className="font-mono text-[10px] text-ink-mute">v0.1</span>
      </div>

      {/* portrait */}
      <div className="relative mt-5 mx-6 h-44 rounded-2xl overflow-hidden border border-white/10">
        <img
          src="/profile6.png"
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
        <ScanLines intensity={0.25} sweep />
        <div className="absolute inset-0 ring-1 ring-inset ring-neon-cyan/30" />
      </div>

      {/* identity */}
      <div className="px-6 pt-5">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-ink-mute">
          designation
        </div>
        <div className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Athul P
        </div>
        <div className="text-sm text-ink-dim">Full-Stack · AI Engineer</div>
      </div>

      {/* footer chip */}
      <div className="absolute bottom-4 inset-x-6 flex items-center justify-between text-[10px] font-mono text-ink-mute">
        <div className="flex items-center gap-1.5">
          <Cpu className="size-3 text-neon-cyan" />
          <span>SIGNED · 0xATH-281</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi className="size-3 text-neon-violet" />
          <span>ONLINE</span>
        </div>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className="relative w-full h-full rounded-[28px] overflow-hidden glass neon-border"
         style={{ backfaceVisibility: "hidden" }}>
      <div className="absolute inset-0 bg-gradient-to-tl from-white/[0.05] via-transparent to-white/[0.02]" />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <ScanLines intensity={0.3} sweep={false} />

      <div className="relative px-6 pt-6 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest uppercase text-ink-dim">
          Authorization Layer
        </span>
        <Sparkles className="size-3.5 text-neon-cyan" />
      </div>

      {/* magnetic strip */}
      <div className="relative mt-5 h-10 bg-black/60 border-y border-white/10">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0_4px,transparent_4px_8px)]" />
      </div>

      {/* QR-like emblem */}
      <div className="relative mx-6 mt-6 grid grid-cols-8 gap-1">
        {Array.from({ length: 64 }).map((_, i) => (
          <span
            key={i}
            className="aspect-square rounded-[2px]"
            style={{
              background:
                (i * 9 + 3) % 5 === 0
                  ? "linear-gradient(135deg,#22d3ee,#8b5cf6)"
                  : (i * 7) % 3 === 0
                    ? "rgba(255,255,255,0.16)"
                    : "rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>

      {/* meta */}
      <div className="absolute bottom-4 inset-x-6">
        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-ink-mute">
          <div>
            <div className="text-ink-dim">REGION</div>
            <div className="text-ink">KL · IN</div>
          </div>
          <div className="text-right">
            <div className="text-ink-dim">SINCE</div>
            <div className="text-ink">2020</div>
          </div>
        </div>
      </div>
    </div>
  );
}
