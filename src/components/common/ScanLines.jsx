import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

/** Cinematic scan overlay: horizontal sweep + faint scanlines + edge glow. */
export function ScanLines({ className, sweep = true, intensity = 0.5 }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* CRT-style horizontal scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
          opacity: intensity,
          mixBlendMode: "overlay",
        }}
      />
      {/* sweep line */}
      {sweep && (
        <motion.div
          initial={{ y: "-20%", opacity: 0 }}
          animate={{ y: "120%", opacity: [0, 0.9, 0] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1.8,
          }}
          className="absolute left-0 right-0 h-24"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.0) 30%, rgba(34,211,238,0.35) 50%, rgba(34,211,238,0.0) 70%, transparent 100%)",
            filter: "blur(2px)",
          }}
        />
      )}
      {/* edge vignette */}
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-[inherit]" />
    </div>
  );
}
