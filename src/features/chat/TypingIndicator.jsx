export function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="size-1.5 rounded-full bg-neon-cyan animate-bounce [animation-delay:-0.2s]" />
      <span className="size-1.5 rounded-full bg-neon-violet animate-bounce [animation-delay:-0.1s]" />
      <span className="size-1.5 rounded-full bg-neon-pink animate-bounce" />
    </div>
  );
}
