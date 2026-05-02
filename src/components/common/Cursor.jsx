import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const ringRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onEnter = (e) => {
      const interactive = e.target.closest?.("a,button,[data-cursor='hover']");
      if (ringRef.current) {
        ringRef.current.style.transform = interactive ? "scale(1.6)" : "scale(1)";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onEnter);
    };
  }, [x, y]);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed top-0 left-0 z-[60] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      >
        <div
          ref={ringRef}
          className="size-7 rounded-full border border-neon-cyan/70 transition-transform duration-200"
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed top-0 left-0 z-[60] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      >
        <div className="size-1.5 rounded-full bg-neon-cyan shadow-[0_0_12px_#22d3ee]" />
      </motion.div>
    </>
  );
}
