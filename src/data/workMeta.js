import {
  Globe,
  GraduationCap,
  ShieldCheck,
  Users,
  ClipboardCheck,
  CalendarCheck,
  Search,
  Code2,
  Rocket,
  Layers,
  Sparkles,
  Briefcase,
  Database,
  Smartphone,
  ShoppingCart,
  LineChart,
} from "lucide-react";

/**
 * Shared metadata for the "Selected work" showcase.
 *
 * IMPORTANT — Tailwind purge safety:
 * The accent values are gradient utility classes (e.g. "from-neon-cyan to-neon-pink").
 * Tailwind's JIT only scans `./src/**\/*.{js,jsx}` (see tailwind.config.js), NOT JSON.
 * Because the work data now lives in `selectedWork.json`, those classes would be
 * purged from the build unless they ALSO appear as literal strings in a scanned file.
 * That's exactly what `WORK_ACCENTS[].className` below is for — keep every accent the
 * admin can pick listed here so the generated CSS always contains it.
 */
export const WORK_ACCENTS = [
  { key: "cyan-pink", label: "Cyan → Pink", className: "from-neon-cyan to-neon-pink" },
  { key: "cyan-violet", label: "Cyan → Violet", className: "from-neon-cyan to-neon-violet" },
  { key: "violet-pink", label: "Violet → Pink", className: "from-neon-violet to-neon-pink" },
  { key: "pink-cyan", label: "Pink → Cyan", className: "from-neon-pink to-neon-cyan" },
  { key: "lime-cyan", label: "Lime → Cyan", className: "from-neon-lime to-neon-cyan" },
  { key: "cyan-lime", label: "Cyan → Lime", className: "from-neon-cyan to-neon-lime" },
  { key: "violet-cyan", label: "Violet → Cyan", className: "from-neon-violet to-neon-cyan" },
  { key: "pink-violet", label: "Pink → Violet", className: "from-neon-pink to-neon-violet" },
];

const ACCENT_CLASSNAMES = WORK_ACCENTS.map((a) => a.className);
const DEFAULT_ACCENT = WORK_ACCENTS[0].className;

/**
 * Resolve an item's accent to a known, JIT-generated class string.
 * Accepts either a preset key ("cyan-pink") or the literal class string.
 */
export function resolveAccent(accent) {
  if (!accent) return DEFAULT_ACCENT;
  if (ACCENT_CLASSNAMES.includes(accent)) return accent;
  const byKey = WORK_ACCENTS.find((a) => a.key === accent);
  return byKey ? byKey.className : DEFAULT_ACCENT;
}

/**
 * Icon registry. The admin picks an icon by name; the card renders the matching
 * lucide component. Keep this list and the admin's options in sync.
 */
export const WORK_ICONS = {
  Globe,
  GraduationCap,
  ShieldCheck,
  Users,
  ClipboardCheck,
  CalendarCheck,
  Search,
  Code2,
  Rocket,
  Layers,
  Sparkles,
  Briefcase,
  Database,
  Smartphone,
  ShoppingCart,
  LineChart,
};

export const WORK_ICON_NAMES = Object.keys(WORK_ICONS);

/** Resolve an icon name to a lucide component, falling back to Globe. */
export function resolveIcon(name) {
  return WORK_ICONS[name] || Globe;
}
