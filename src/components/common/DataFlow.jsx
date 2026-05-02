import { motion } from "framer-motion";

/** Animated SVG circuit lines + drifting nodes (background ambience). */
export function DataFlow({ className }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      className={className}
    >
      <defs>
        <linearGradient id="df-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="df-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint base grid lines */}
      <g stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none">
        <path d="M0 220 L 380 220 L 420 260 L 720 260" />
        <path d="M0 540 L 280 540 L 320 580 L 540 580 L 580 540 L 900 540" />
        <path d="M1200 140 L 880 140 L 840 180 L 660 180" />
        <path d="M1200 660 L 940 660 L 900 620 L 780 620" />
        <path d="M120 0 L 120 140 L 160 180 L 160 320" />
        <path d="M1080 800 L 1080 660 L 1040 620 L 1040 480" />
      </g>

      {/* highlighted live trace 1 */}
      <motion.path
        d="M0 220 L 380 220 L 420 260 L 720 260"
        stroke="url(#df-line)"
        strokeWidth="1.4"
        fill="none"
        strokeDasharray="80 800"
        initial={{ strokeDashoffset: 880 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 4.2, ease: "linear", repeat: Infinity }}
      />

      {/* highlighted live trace 2 */}
      <motion.path
        d="M1200 660 L 940 660 L 900 620 L 780 620"
        stroke="url(#df-line)"
        strokeWidth="1.4"
        fill="none"
        strokeDasharray="60 800"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -860 }}
        transition={{ duration: 5, ease: "linear", repeat: Infinity, delay: 0.6 }}
      />

      {/* drifting nodes */}
      {[
        { cx: 120, cy: 140, d: 0 },
        { cx: 660, cy: 180, d: 1.2 },
        { cx: 540, cy: 580, d: 0.8 },
        { cx: 900, cy: 540, d: 2.1 },
        { cx: 780, cy: 620, d: 1.6 },
        { cx: 160, cy: 320, d: 0.4 },
      ].map((n) => (
        <motion.circle
          key={`${n.cx}-${n.cy}`}
          cx={n.cx}
          cy={n.cy}
          r="6"
          fill="url(#df-node)"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: n.d }}
        />
      ))}
    </svg>
  );
}
