import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"
    />
  );
}
