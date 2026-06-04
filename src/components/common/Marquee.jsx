import { useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  wrap,
} from "framer-motion";
import { cn } from "@/utils/cn";

function Sequence({ items, itemClassName, separatorClassName }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {items.map((item, i) => (
        <li key={i} className={cn("flex items-center", itemClassName)}>
          <span>{item}</span>
          <span className={cn("mx-6 md:mx-12", separatorClassName ?? "text-neon-cyan/70")}>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Marquee — seamless infinite ticker. Two identical copies of the items
 * slide left by exactly 50% so the loop is invisible.
 */
export function Marquee({
  items,
  speed = 32,
  className,
  itemClassName,
  separatorClassName,
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        <Sequence
          items={items}
          itemClassName={itemClassName}
          separatorClassName={separatorClassName}
        />
        <Sequence
          items={items}
          itemClassName={itemClassName}
          separatorClassName={separatorClassName}
        />
      </motion.div>
    </div>
  );
}

/**
 * VelocityMarquee — the ticker scrolls on its own, but page scroll injects
 * velocity: scroll down and it speeds up, scroll up and it reverses. The
 * track is also skewed slightly by the live scroll velocity for that
 * "kinetic typography" feel common to agency sites.
 */
export function VelocityMarquee({
  items,
  baseVelocity = 3,
  className,
  itemClassName,
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(smooth, [-2000, 2000], [-6, 6], { clamp: true });

  // wrap keeps x within [-50%, 0] so the doubled track loops seamlessly.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    moveBy += dir.current * moveBy * Math.abs(f);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div className="flex w-max" style={{ x, skewX: skew }}>
        <Sequence items={items} itemClassName={itemClassName} />
        <Sequence items={items} itemClassName={itemClassName} />
      </motion.div>
    </div>
  );
}
