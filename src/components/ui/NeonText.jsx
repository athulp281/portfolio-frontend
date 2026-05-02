import { cn } from "@/utils/cn";

export function NeonText({ className, children, as: Comp = "span" }) {
  return (
    <Comp className={cn("text-gradient font-display", className)}>
      {children}
    </Comp>
  );
}
