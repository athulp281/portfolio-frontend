import {
  ClipboardList,
  Layers,
  Server,
  Cpu,
  Boxes,
  Cloud,
  Code2,
  Database,
  PenTool,
  Smartphone,
  ShieldCheck,
  GitBranch,
  Workflow,
  Sparkles,
} from "lucide-react";

/**
 * Capability metadata. Gradients reuse the Tailwind-safe `WORK_ACCENTS` from
 * workMeta (the literal class strings live there so JIT keeps them), so the
 * admin's gradient picker and `resolveAccent` are shared across both resources.
 * Only the icon set is capability-specific.
 */
export { WORK_ACCENTS as CAP_GRADS, resolveAccent as resolveGrad } from "./workMeta";

export const CAP_ICONS = {
  ClipboardList,
  Layers,
  Server,
  Cpu,
  Boxes,
  Cloud,
  Code2,
  Database,
  PenTool,
  Smartphone,
  ShieldCheck,
  GitBranch,
  Workflow,
  Sparkles,
};

export const CAP_ICON_NAMES = Object.keys(CAP_ICONS);

/** Resolve an icon name to a lucide component, falling back to Layers. */
export function resolveCapIcon(name) {
  return CAP_ICONS[name] || Layers;
}
