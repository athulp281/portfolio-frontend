import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const POS = {
  right: "justify-end items-center",
  left: "justify-start items-center",
  center: "justify-center items-center",
};

/**
 * SectionBackdrop — a single profile image used as a soft, slowly drifting
 * background accent behind a section. Grayscale + radial-masked + very low
 * opacity so it never fights the foreground text, and theme-agnostic.
 *
 * Mobile-safe: on small screens it renders smaller, fainter, and WITHOUT the
 * continuous float (static), so it neither hurts readability nor burns battery
 * with always-running animations. Clipped to the section (overflow-hidden) so
 * it can't cause horizontal scroll.
 */
export function SectionBackdrop({
  src,
  position = "right",
  size = "46vw",
  opacity = 0.24,
}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden flex",
        POS[position],
      )}
    >
      <motion.img
        src={src}
        alt=""
        draggable={false}
        className="h-auto select-none"
        style={{
          width: isMobile ? "78vw" : size,
          maxWidth: 680,
          opacity: isMobile ? opacity * 0.7 : opacity,
          filter: "grayscale(1) contrast(1.08)",
          WebkitMaskImage:
            "radial-gradient(78% 78% at 50% 45%, #000 62%, transparent 92%)",
          maskImage:
            "radial-gradient(78% 78% at 50% 45%, #000 62%, transparent 92%)",
        }}
        animate={isMobile ? undefined : { y: [-16, 16, -16], scale: [1, 1.03, 1] }}
        transition={
          isMobile
            ? undefined
            : { duration: 16, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </div>
  );
}
