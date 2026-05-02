import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignored */
    }
  };

  return (
    <div className="group relative my-3 rounded-xl overflow-hidden border border-white/10 bg-black/60">
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-widest text-ink-mute border-b border-white/10 bg-white/5">
        <span className="font-mono">{match?.[1] || "code"}</span>
        <button
          onClick={onCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-ink-dim hover:text-ink hover:bg-white/10 transition",
          )}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={match?.[1] || "text"}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: "transparent",
          padding: "1rem",
          fontSize: "0.85rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export const Markdown = memo(function Markdown({ children }) {
  return (
    <div className="md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ code: CodeBlock }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
