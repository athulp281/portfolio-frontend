import { cn } from "@/utils/cn";

export function GlassPanel({ className, children, ...props }) {
  return (
    <div
      className={cn("glass neon-border rounded-2xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}
