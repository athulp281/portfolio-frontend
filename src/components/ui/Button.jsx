import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const variants = {
  primary:
    "bg-gradient-to-r from-neon-cyan to-neon-violet text-bg shadow-neon hover:brightness-110",
  ghost: "bg-white/5 text-ink hover:bg-white/10 border border-white/10",
  outline:
    "bg-transparent text-ink border border-white/15 hover:border-neon-cyan/60 hover:text-neon-cyan",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-2xl",
};

export const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", as: Comp = "button", children, ...props },
  ref,
) {
  const MotionComp = motion(Comp);
  return (
    <MotionComp
      ref={ref}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-colors",
        variants[variant],
        sizes[size],
        className,
      )}
      data-cursor="hover"
      {...props}
    >
      {children}
    </MotionComp>
  );
});
