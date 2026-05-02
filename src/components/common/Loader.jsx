import { cn } from "@/utils/cn";

export function Loader({ fullscreen = false, label = "Loading" }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3",
        fullscreen && "fixed inset-0 z-[100] bg-bg/80 backdrop-blur-sm",
      )}
    >
      <div className="relative size-10">
        <span className="absolute inset-0 rounded-full border-2 border-neon-cyan/30 animate-pulseRing" />
        <span className="absolute inset-2 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet shadow-neon" />
      </div>
      <span className="font-mono text-xs text-ink-dim tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}
