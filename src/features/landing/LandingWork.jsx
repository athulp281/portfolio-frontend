import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useProjectStore } from "@/store";
import { Reveal } from "@/components/common/Reveal";
import { SectionBackdrop } from "@/components/common/SectionBackdrop";
import { cn } from "@/utils/cn";

const easing = [0.16, 1, 0.3, 1];

/**
 * Selected work — an editorial index of oversized project titles on hairline
 * dividers (no boxes). Hovering a row lifts a poster preview that tracks the
 * cursor; the title slides and brightens. Mobile shows the poster inline.
 */
export function LandingWork() {
  const projects = useProjectStore((s) => s.projects);
  const [active, setActive] = useState(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 350, damping: 30, mass: 0.4 });
  const py = useSpring(my, { stiffness: 350, damping: 30, mass: 0.4 });
  const onMove = (e) => {
    mx.set(e.clientX);
    my.set(e.clientY);
  };

  return (
    <section
      id="work"
      onMouseMove={onMove}
      className="relative w-full py-28 md:py-40"
    >
      <SectionBackdrop src="/profile3.png" position="right" opacity={0.16} />
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <Reveal className="flex items-end justify-between gap-6 mb-14 md:mb-20">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute">
              (03) — Selected work
            </div>
            <h2 className="mt-5 font-display font-semibold tracking-[-0.03em] leading-[0.95] text-ink text-[clamp(2.5rem,8vw,6.5rem)]">
              Things I've shipped
            </h2>
          </div>
          <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.3em] text-ink-mute pb-3">
            {String(projects.length).padStart(2, "0")} projects
          </span>
        </Reveal>

        <div className="border-t border-line/12">
          {projects.map((project, i) => (
            <WorkRow
              key={project.id}
              project={project}
              index={i}
              onEnter={() => setActive(i)}
              onLeave={() => setActive(null)}
            />
          ))}
        </div>
      </div>

      {/* cursor-tracked poster (desktop) */}
      <motion.div
        aria-hidden
        style={{ left: px, top: py }}
        className="pointer-events-none fixed z-40 hidden md:block -translate-x-1/2 -translate-y-1/2"
      >
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={projects[active].id}
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35, ease: easing }}
              className="w-[320px] h-[230px] overflow-hidden rounded-xl"
            >
              <Poster project={projects[active]} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function WorkRow({ project, index, onEnter, onLeave }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.a
      href="#"
      onClick={(e) => e.preventDefault()}
      onMouseEnter={() => {
        setHover(true);
        onEnter();
      }}
      onMouseLeave={() => {
        setHover(false);
        onLeave();
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: easing, delay: index * 0.05 }}
      data-cursor-label="View"
      className="group relative block border-b border-line/12"
    >
      <div className="flex items-center gap-5 md:gap-10 py-7 md:py-12">
        <span className="font-mono text-xs md:text-sm text-ink-mute w-8 md:w-14 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>

        <motion.h3
          className="flex-1 min-w-0 font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[clamp(1.8rem,6.5vw,5rem)]"
          animate={{ x: hover ? 18 : 0, color: hover ? "#e6e9f2" : "#9aa3b8" }}
          transition={{ duration: 0.45, ease: easing }}
        >
          {project.title}
        </motion.h3>

        <span className="hidden lg:block font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mute max-w-[14rem] text-right">
          {project.stack.slice(0, 3).join("  ·  ")}
        </span>

        <motion.span
          aria-hidden
          className="hidden md:grid place-items-center size-12 rounded-full border border-line/15 shrink-0"
          animate={{
            rotate: hover ? 45 : 0,
            borderColor: hover ? "rgba(230,233,242,0.6)" : "rgba(255,255,255,0.15)",
            color: hover ? "#e6e9f2" : "#5b647a",
          }}
          transition={{ duration: 0.45, ease: easing }}
        >
          <ArrowUpRight className="size-5" />
        </motion.span>
      </div>

      {/* inline poster on mobile */}
      <div className="md:hidden pb-7">
        <div className="h-44 overflow-hidden rounded-lg">
          <Poster project={project} />
        </div>
        <p className="mt-3 text-ink-dim text-sm leading-relaxed">
          {project.summary}
        </p>
      </div>
    </motion.a>
  );
}

/** Poster — gradient placeholder built from the project's accent gradient. */
function Poster({ project }) {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-gradient-to-br p-5 flex flex-col justify-between",
        project.accent,
      )}
    >
      <div className="absolute inset-0 bg-bg/30" />
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-bg/90">
        <span>{project.id}</span>
        <span>↗</span>
      </div>
      <div className="relative">
        <h4 className="font-display font-semibold text-bg text-xl leading-tight drop-shadow">
          {project.title}
        </h4>
        <p className="mt-1.5 text-bg/80 text-[11px] leading-snug line-clamp-2">
          {project.summary}
        </p>
      </div>
    </div>
  );
}
