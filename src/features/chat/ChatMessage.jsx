import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { Markdown } from "./Markdown";
import { TypingIndicator } from "./TypingIndicator";
import { cn } from "@/utils/cn";

const easing = [0.16, 1, 0.3, 1];

/**
 * Modern chat message — Claude / ChatGPT inspired.
 *
 *   • Assistant messages render WITHOUT a bubble: avatar + name on top,
 *     then content flowing full-width in the column. Hover reveals a
 *     subtle action row (copy, thumbs).
 *   • User messages render as compact rounded pills on the right with a
 *     soft gradient surface. No avatar — keeps the column clean.
 *   • Streaming uses a small shimmer dot inline with the last token
 *     instead of a hard block-cursor.
 */
export function ChatMessage({ message, index = 0 }) {
  const isUser = message.role === "user";
  return isUser ? (
    <UserMessage message={message} index={index} />
  ) : (
    <AssistantMessage message={message} index={index} />
  );
}

function UserMessage({ message, index }) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 14, x: 8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: 0.4,
        ease: easing,
        delay: Math.min(index * 0.015, 0.08),
      }}
      className="flex justify-end"
    >
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] rounded-2xl rounded-tr-md px-4 py-2.5 leading-relaxed",
          "bg-gradient-to-br from-cyan-400/[0.14] to-indigo-500/[0.18]",
          "border border-white/10 text-ink",
          "shadow-[0_4px_20px_-8px_rgba(56,180,255,0.35)]",
        )}
      >
        <div className="whitespace-pre-wrap text-[15px] md:text-[15.5px]">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}

function AssistantMessage({ message, index }) {
  const [copied, setCopied] = useState(false);
  const empty = !message.content;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: 0.45,
        ease: easing,
        delay: Math.min(index * 0.015, 0.08),
      }}
      className="group/msg flex flex-col gap-2"
    >
      {/* Identity row: avatar + name */}
      <div className="flex items-center gap-2.5">
        <motion.div
          initial={{ scale: 0.7, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.45, ease: easing }}
          className={cn(
            "shrink-0 relative size-7 md:size-8 rounded-full p-[1.5px]",
            "bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500",
            "shadow-[0_4px_14px_-4px_rgba(56,180,255,0.55)]",
          )}
        >
          <span className="block size-full rounded-full overflow-hidden bg-bg ring-1 ring-white/10">
            <img
              src="/profile5.png"
              alt="Athion AI"
              draggable={false}
              className="w-full h-full object-cover"
            />
          </span>
          {/* Online dot — only while not streaming, otherwise the
              shimmer dot handles activity signaling. */}
          {!message.streaming && (
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-bg shadow-[0_0_8px_rgba(52,211,153,0.9)]"
            />
          )}
        </motion.div>
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-display text-[13.5px] md:text-sm font-semibold tracking-tight text-ink">
            Athion AI
          </span>
          {message.streaming && (
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
              thinking
            </span>
          )}
        </div>
      </div>

      {/* Content column — indented under the avatar so the role grouping
          reads visually. No bubble; just typography on the page. */}
      <div className="pl-9 md:pl-10">
        <div
          className={cn(
            "text-[15px] md:text-[15.5px] leading-relaxed text-ink",
            message.error && "text-red-300",
          )}
        >
          {empty && message.streaming ? (
            <TypingIndicator />
          ) : (
            <Markdown>{message.content || ""}</Markdown>
          )}
          {message.streaming && message.content && (
            <span className="inline-flex items-center align-middle ml-1">
              <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(56,180,255,0.8)] animate-pulse" />
            </span>
          )}
        </div>

        {/* Action row — copy / regenerate / feedback. Hidden until hover
            on desktop, always-on on touch. Skipped while streaming and
            for the empty placeholder bubble. */}
        {!empty && !message.streaming && (
          <div
            className={cn(
              "mt-2 -ml-1.5 flex items-center gap-0.5",
              "opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100",
              "transition-opacity duration-200",
              "[@media(hover:none)]:opacity-100",
            )}
          >
            <ActionBtn
              label={copied ? "Copied" : "Copy"}
              onClick={copy}
              active={copied}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="size-3.5 text-emerald-300" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Copy className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </ActionBtn>
            <ActionBtn label="Good response">
              <ThumbsUp className="size-3.5" />
            </ActionBtn>
            <ActionBtn label="Bad response">
              <ThumbsDown className="size-3.5" />
            </ActionBtn>
            {message.error && (
              <ActionBtn label="Try again">
                <RotateCcw className="size-3.5" />
              </ActionBtn>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionBtn({ children, label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center size-7 rounded-md",
        "text-ink-mute hover:text-ink",
        "hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors",
        active && "text-emerald-300",
      )}
      data-cursor="hover"
    >
      {children}
    </button>
  );
}
