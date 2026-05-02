import { motion } from "framer-motion";

/**
 * Clean radial-gradient background for the chat surface.
 *
 * Previously this layer had a grid pattern, a horizon arc, a horizon line
 * and drifting particles — they read as "lines" over the chat. Stripped
 * to just:
 *   • a deep dark-blue → black radial base
 *   • a soft pulsing glow rising from the bottom (the "presence" of AI)
 *   • a top vignette so the floating header reads cleanly
 */
export function ChatBackgroundGlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 100%, #0a1d3e 0%, #061129 35%, #02060f 70%, #02040a 100%)",
        }}
      />

      <motion.div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: "-32%",
          width: "150vw",
          height: "100vw",
          maxHeight: "130vh",
          background:
            "radial-gradient(closest-side, rgba(56,140,255,0.42), rgba(99,102,241,0.16) 45%, transparent 75%)",
          filter: "blur(50px)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-bg/85 to-transparent" />
    </div>
  );
}
