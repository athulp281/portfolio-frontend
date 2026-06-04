import { useEffect } from "react";

/**
 * Keeps the `--app-vh` CSS custom property in sync with the *visual*
 * viewport height (in px).
 *
 * Why this exists: on iOS Safari the on-screen keyboard shrinks the
 * `window.visualViewport` but does NOT shrink `100dvh` / `100vh` — those
 * units only account for the browser chrome (URL bar), never the keyboard.
 * So a chat shell locked to `100dvh` with a `bottom-0` input dock keeps its
 * full height when the keyboard opens, pushing the dock behind the keyboard
 * and leaving a band of scrollable dead-space the page can drift into.
 *
 * Anchoring the chat shell to `var(--app-vh)` instead makes it collapse to
 * exactly the keyboard-free region, so the input stays pinned just above the
 * keyboard and there's nothing left to scroll. On browsers without the
 * `visualViewport` API we fall back to `window.innerHeight`, and consumers
 * keep `100dvh` as the static CSS fallback.
 */
export function useVisualViewportHeight() {
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;

    const set = () => {
      const h = vv ? vv.height : window.innerHeight;
      root.style.setProperty("--app-vh", `${Math.round(h)}px`);
    };

    set();

    if (vv) {
      vv.addEventListener("resize", set);
      // `scroll` fires when the keyboard pans the visual viewport — keep the
      // height in sync so the shell never lags behind the keyboard.
      vv.addEventListener("scroll", set);
    } else {
      window.addEventListener("resize", set);
    }

    return () => {
      if (vv) {
        vv.removeEventListener("resize", set);
        vv.removeEventListener("scroll", set);
      } else {
        window.removeEventListener("resize", set);
      }
      root.style.removeProperty("--app-vh");
    };
  }, []);
}
