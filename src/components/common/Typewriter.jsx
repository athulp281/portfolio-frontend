import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

/**
 * One-shot typewriter. Types `text` once, then idles.
 * `delay` = ms before typing starts (use to sequence multiple lines).
 */
export function Typewriter({
  text,
  speed = 28,
  delay = 0,
  cursor = true,
  className,
  onDone,
}) {
  const [out, setOut] = useState("");
  const [started, setStarted] = useState(delay === 0);

  useEffect(() => {
    if (delay <= 0) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const tick = () => {
      i += 1;
      setOut(text.slice(0, i));
      if (i < text.length) {
        timer = setTimeout(tick, speed);
      } else if (onDone) {
        onDone();
      }
    };
    let timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [started, text, speed, onDone]);

  return (
    <span className={cn("inline", className)}>
      {out}
      {cursor && (
        <span
          aria-hidden
          className="inline-block w-[2px] h-[0.95em] -mb-0.5 ml-1 bg-neon-cyan animate-pulse align-middle"
        />
      )}
    </span>
  );
}
