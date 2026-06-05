import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
} from "framer-motion";
import { useProjectStore } from "@/store";
import { SectionBackdrop } from "@/components/common/SectionBackdrop";
import { cn } from "@/utils/cn";

// Must be an easing FUNCTION (not a raw bezier array) for useTransform's
// `ease` option on multi-segment ranges.
const easeIO = cubicBezier(0.65, 0, 0.35, 1);

// Stock imagery for the card faces (cycled across projects by index).
const PROJECT_IMAGES = [
  "/new%20images/canva-software-developer-working.jpg",
  "/new%20images/comprehensive-guide-czmq-mv1njzs8.jpg",
  "/new%20images/software-developer-working-stockcake.webp",
  "/new%20images/young-contemporary-software-developer-working-by-computer_274679-30538.avif",
];

/**
 * Selected work — a pinned card-deck "deal". The projects sit as a centred
 * stack; scrolling deals the front card off (rotate + slide away, alternating
 * sides) to reveal the next. A cinematic, scroll-driven reveal that's distinct
 * from the hero's split-and-flip.
 */
export function LandingWork() {
  const projects = useProjectStore((s) => s.projects);
  const sectionRef = useRef(null);
  const n = projects.length;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Heavily-damped spring → consistent smooth deal whether scrolling fast or
  // slow (velocity spikes are absorbed by the extra mass + damping).
  const p = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 34,
    mass: 0.9,
  });

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative"
      style={{ height: `${Math.max(300, n * 62)}svh` }}
    >
      <SectionBackdrop src="/profile3.png" position="right" opacity={0.18} />

      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10 pt-24 md:pt-28 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute">
              (03) — Selected work
            </div>
            <h2 className="mt-4 font-display font-semibold tracking-[-0.03em] leading-[0.95] text-ink text-[clamp(2rem,6vw,4.5rem)]">
              Things I've shipped
            </h2>
          </div>
          <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.3em] text-ink-mute pb-2">
            {String(n).padStart(2, "0")} projects
          </span>
        </div>

        {/* Deck stage */}
        <div className="relative flex-1" style={{ perspective: 1500 }}>
          {projects.map((project, i) => (
            <DealCard
              key={project.id}
              project={project}
              index={i}
              total={n}
              p={p}
              image={PROJECT_IMAGES[i % PROJECT_IMAGES.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DealCard({ project, index, total, p, image }) {
  const last = index === total - 1;
  const a = index / total; // deal-off start
  const b = (index + 1) / total; // deal-off end
  const dir = index % 2 === 0 ? 1 : -1;

  // Rest pose: a subtle stack peek; the final card rests dead-centre.
  const restRot = last ? 0 : index * -1.6;
  const restY = last ? 0 : index * 1.4; // %
  const restScale = last ? 1 : 1 - index * 0.02;

  // Monotonic input ranges (handle the index-0 case where a === 0).
  const inRange = a === 0 ? [a, b, 1] : [0, a, b, 1];
  const seq = (rest, dealt) =>
    a === 0 ? [rest, dealt, dealt] : [rest, rest, dealt, dealt];
  const opRange = a === 0 ? [a, b] : [0, a, b];
  const opSeq = a === 0 ? [1, 0] : [1, 1, 0];

  const x = useTransform(
    p,
    last ? [0, 1] : inRange,
    last ? ["0%", "0%"] : seq("0%", `${dir * 130}%`),
    { ease: easeIO },
  );
  const y = useTransform(
    p,
    last ? [0, 1] : inRange,
    last ? ["0%", "0%"] : seq(`${restY}%`, "-9%"),
    { ease: easeIO },
  );
  const rotateZ = useTransform(
    p,
    last ? [0, 1] : inRange,
    last ? [restRot, restRot] : seq(restRot, dir * 22),
    { ease: easeIO },
  );
  const scale = useTransform(
    p,
    last ? [0, 1] : inRange,
    last ? [restScale, restScale] : seq(restScale, restScale),
  );
  const opacity = useTransform(p, last ? [0, 1] : opRange, last ? [1, 1] : opSeq);

  return (
    // Centering on the wrapper (plain CSS) — framer owns transform on the card.
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ zIndex: total - index }}
    >
      <motion.article
        style={{ x, y, rotateZ, scale, opacity }}
        className="w-[clamp(290px,74vw,540px)] overflow-hidden rounded-2xl border border-line/10 bg-bg-soft shadow-glass"
        data-cursor-label="View"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={project.title}
            draggable={false}
            className="h-full w-full object-cover"
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-tr opacity-40 mix-blend-multiply",
              project.accent,
            )}
          />
          <div className="absolute inset-0 bg-black/15" />
          <span className="absolute top-4 left-5 font-mono text-[11px] uppercase tracking-[0.3em] text-white/90">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="p-5 md:p-7">
          <h3 className="font-display font-semibold tracking-[-0.02em] text-2xl md:text-3xl text-ink">
            {project.title}
          </h3>
          <p className="mt-2 text-ink-dim text-sm md:text-[15px] leading-relaxed">
            {project.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
            {project.stack.map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
