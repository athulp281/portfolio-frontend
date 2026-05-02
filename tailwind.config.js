/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#05060a",
          soft: "#0a0d14",
          panel: "#0e1220",
        },
        ink: {
          DEFAULT: "#e6e9f2",
          dim: "#9aa3b8",
          mute: "#5b647a",
        },
        neon: {
          cyan: "#22d3ee",
          violet: "#8b5cf6",
          pink: "#f472b6",
          lime: "#a3e635",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        tech: ["Audiowide", "Michroma", "'Bruno Ace SC'", "Orbitron", "sans-serif"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(34,211,238,0.08), transparent 60%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      boxShadow: {
        neon: "0 0 24px rgba(34,211,238,0.35), 0 0 64px rgba(139,92,246,0.25)",
        glass: "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px -20px rgba(0,0,0,0.6)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
        pulseRing: "pulseRing 1.6s cubic-bezier(0.4,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};
