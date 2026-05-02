import { create } from "zustand";
import { askQuestion } from "@/services/chat.service";

const uid = () =>
  `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

/**
 * Reveal text in batched chunks on each animation frame. Pushing several
 * tokens per frame (instead of one token per setTimeout) keeps the typing
 * effect feeling fluid while finishing in a fraction of the time, and
 * pacing on rAF avoids React re-renders racing the browser's repaint.
 */
async function revealText(fullText, onChunk, signal) {
  const tokens = fullText.match(/(\s+|\S+)/g) ?? [fullText];
  if (!tokens.length) return;
  // Scale tokens-per-frame with reply length so short answers still feel
  // typed, but long ones don't drag on. ~3-8 tokens/frame at 60fps lands
  // around 180-480 tokens/sec — fast and smooth.
  const perFrame = Math.max(3, Math.min(8, Math.ceil(tokens.length / 120)));

  let i = 0;
  return new Promise((resolve) => {
    const tick = () => {
      if (signal?.aborted) return resolve();
      const slice = tokens.slice(i, i + perFrame).join("");
      if (slice) onChunk(slice);
      i += perFrame;
      if (i >= tokens.length) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const SUGGESTIONS = [
  "Who are you?",
  "Show me your top projects",
  "What's your tech stack?",
  "How do I contact you?",
  "Tell me about Athion AI",
];

export const useChatStore = create((set, get) => ({
  messages: [
    {
      id: "intro",
      role: "assistant",
      content:
        "Hey, I'm **Athion AI** — Athul's personal AI. Ask me about his work, skills, or anything technical.",
      createdAt: Date.now(),
    },
  ],
  status: "idle", // idle | sending | streaming | error
  error: null,
  abortController: null,
  suggestions: SUGGESTIONS,

  reset: () =>
    set({
      messages: [],
      status: "idle",
      error: null,
      abortController: null,
    }),

  /**
   * Reset to the landing/hero state — keeps the assistant intro greeting
   * and clears any in-flight streaming, so `<ChatHero/>` swaps back in.
   */
  newChat: () => {
    const c = get().abortController;
    if (c) c.abort();
    set({
      messages: [
        {
          id: "intro",
          role: "assistant",
          content:
            "Hey, I'm **Athion AI** — Athul's personal AI. Ask me about his work, skills, or anything technical.",
          createdAt: Date.now(),
        },
      ],
      status: "idle",
      error: null,
      abortController: null,
    });
  },

  cancel: () => {
    const c = get().abortController;
    if (c) c.abort();
    set({ status: "idle", abortController: null });
  },

  sendMessage: async (text) => {
    const trimmed = text.trim();
    if (!trimmed || get().status !== "idle") return;

    const userMsg = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    const assistantId = uid();
    const assistantMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      streaming: true,
    };

    const controller = new AbortController();
    set({
      messages: [...get().messages, userMsg, assistantMsg],
      status: "sending",
      error: null,
      abortController: controller,
    });

    try {
      const reply = await askQuestion(trimmed, { signal: controller.signal });
      set({ status: "streaming" });

      await revealText(
        reply ?? "",
        (chunk) => {
          set({
            messages: get().messages.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m,
            ),
          });
        },
        controller.signal,
      );

      set({
        messages: get().messages.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        ),
        status: "idle",
        abortController: null,
      });
    } catch (err) {
      if (controller.signal.aborted) {
        set({
          messages: get().messages.map((m) =>
            m.id === assistantId
              ? { ...m, streaming: false, content: m.content || "_(cancelled)_" }
              : m,
          ),
          status: "idle",
          abortController: null,
        });
        return;
      }
      set({
        messages: get().messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                streaming: false,
                content:
                  "Sorry — I couldn't reach my brain just now. Please try again.",
                error: true,
              }
            : m,
        ),
        status: "error",
        error: err?.message || "Request failed",
        abortController: null,
      });
    }
  },
}));
