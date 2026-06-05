import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Reveal } from "@/components/common/Reveal";
import { SectionBackdrop } from "@/components/common/SectionBackdrop";
import capabilitiesData from "@/data/capabilities.json";
import { resolveCapIcon, resolveGrad } from "@/data/capabilityMeta";

const easing = [0.16, 1, 0.3, 1];

/**
 * Capabilities come from `src/data/capabilities.json` (the single source of
 * truth the /admin Capabilities panel edits). The display number is derived
 * from order, and icon/gradient resolve through capabilityMeta so admin-added
 * entries render correctly.
 */
const CAPABILITIES = capabilitiesData.map((c, i) => ({
  ...c,
  no: String(i + 1).padStart(2, "0"),
  Icon: resolveCapIcon(c.icon),
  gradClass: resolveGrad(c.grad),
}));

/**
 * Capabilities — a "now-showing" split. The left column is pinned (sticky) and
 * shows the active capability as a big number + title + accent panel; the
 * right column is the scrollable list, and whichever entry is in view drives
 * the left display. Deliberately a different shape from the Work index.
 */
export function LandingServices() {
  const [active, setActive] = useState(0);
  const cap = CAPABILITIES[active];
  const listRef = useRef(null);

  // Drive the active card from the list's scroll progress, smoothed through a
  // slow overdamped spring so fast scrolling paces the changes gently instead
  // of jumping straight to the end.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start center", "end center"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 46,
    damping: 28,
    mass: 1.15,
  });
  useMotionValueEvent(smooth, "change", (v) => {
    const i = Math.min(
      CAPABILITIES.length - 1,
      Math.max(0, Math.floor(v * CAPABILITIES.length)),
    );
    setActive((prev) => (prev !== i ? i : prev));
  });

  return (
    <section id="skills" className="relative w-full py-28 md:py-40">
      <SectionBackdrop src="/profile4.png" position="left" opacity={0.2} />
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
        {/* LEFT — pinned display. `sticky` lives on the grid item (with
            self-start) so it pins across the whole section on BOTH desktop and
            the single-column mobile layout. Heights are svh-bounded to fit. */}
        <div className="md:col-span-5 self-start sticky top-16 md:top-24 z-10 bg-bg md:bg-transparent pt-3 pb-5 md:py-0 border-b border-line/10 md:border-0">
            <Reveal className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute mb-6">
              (02) — Capabilities
            </Reveal>

            {/* Keyed remount = quick fade-in on change, with NO exit-wait
                blocking (which made fast scrolling feel stuck). */}
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easing }}
            >
              <div className="font-display font-semibold leading-none text-ink/12 text-[clamp(3.5rem,7vw,7rem)]">
                {cap.no}
              </div>
              <h2 className="-mt-2 font-display font-semibold tracking-[-0.03em] text-ink text-[clamp(2rem,4.2vw,3.25rem)]">
                {cap.title}
              </h2>
              <p className="mt-3 max-w-sm text-ink-dim text-sm md:text-base leading-relaxed">
                {cap.desc}
              </p>
            </motion.div>

            {/* accent panel — ALL images stay mounted (preloaded) and crossfade
                by opacity, so switching is instant with no load flash. Bounded
                height keeps the card fully visible on screen. */}
            <div
              className="mt-5 md:mt-6 relative w-full overflow-hidden rounded-2xl bg-bg-soft"
              style={{ height: "clamp(120px, 20svh, 250px)" }}
            >
              {CAPABILITIES.map((c, idx) => (
                <img
                  key={c.title}
                  src={c.img}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                  style={{ opacity: idx === active ? 1 : 0 }}
                />
              ))}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cap.gradClass} opacity-55 mix-blend-multiply`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <cap.Icon className="absolute right-6 bottom-6 size-11 text-white drop-shadow" />
              <span className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/90">
                {cap.tags.length} tools
              </span>
            </div>
        </div>

        {/* RIGHT — scrollable list; its scroll progress drives the active card */}
        <div className="md:col-span-7 md:pt-16" ref={listRef}>
          <div className="border-t border-line/12">
            {CAPABILITIES.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: easing }}
                className="border-b border-line/12 py-14 md:py-20"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <motion.h3
                    className="font-display font-semibold tracking-[-0.02em] text-[clamp(1.6rem,4vw,2.75rem)] transition-colors duration-300"
                    animate={{ color: active === i ? "#e6e9f2" : "#5b647a" }}
                  >
                    {c.title}
                  </motion.h3>
                  <span className="font-mono text-xs text-ink-mute shrink-0">
                    {c.no}
                  </span>
                </div>
                <p className="mt-3 max-w-lg text-ink-dim text-sm md:text-base leading-relaxed">
                  {c.desc}
                </p>
                <p className="mt-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-ink-mute">
                  {c.tags.join("  ·  ")}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
