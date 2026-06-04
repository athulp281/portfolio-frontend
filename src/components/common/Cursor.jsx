import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor with three states:
 *   • default      — small dot + thin ring
 *   • interactive  — ring grows (links / buttons / [data-cursor="hover"])
 *   • labelled     — ring becomes a filled disc showing a word, when hovering
 *                    an element with [data-cursor-label="View"] (agency style)
 *
 * Fine-pointer only; touch devices never mount the listeners.
 */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  const [label, setLabel] = useState("");
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e) => {
      const labelled = e.target.closest?.("[data-cursor-label]");
      const interactive = e.target.closest?.(
        "a,button,[data-cursor='hover']",
      );
      setLabel(labelled?.getAttribute("data-cursor-label") || "");
      setHovering(Boolean(interactive || labelled));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [x, y]);

  return (
    <>
      {/* Ring / label disc */}
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed top-0 left-0 z-[60] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      >
        <motion.div
          className="grid place-items-center rounded-full font-mono text-[10px] uppercase tracking-[0.2em]"
          animate={{
            width: label ? 72 : hovering ? 44 : 28,
            height: label ? 72 : hovering ? 44 : 28,
            backgroundColor: label ? "#22d3ee" : "rgba(34,211,238,0)",
            borderColor: label ? "rgba(34,211,238,0)" : "rgba(34,211,238,0.7)",
            color: "#05060a",
          }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          style={{ borderWidth: 1, borderStyle: "solid" }}
        >
          {label && <span>{label}</span>}
        </motion.div>
      </motion.div>

      {/* Center dot — hidden while a label is shown */}
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed top-0 left-0 z-[60] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        animate={{ opacity: label ? 0 : 1 }}
      >
        <div className="size-1.5 rounded-full bg-neon-cyan shadow-[0_0_12px_#22d3ee]" />
      </motion.div>
    </>
  );
}
