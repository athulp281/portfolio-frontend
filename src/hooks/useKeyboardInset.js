import { useEffect } from "react";

/**
 * Publishes the on-screen keyboard's height as the `--kb` CSS custom
 * property (in px, 0 when no keyboard is shown).
 *
 * iOS Safari overlays the keyboard on top of the page: `window.innerHeight`
 * stays constant while `window.visualViewport.height` shrinks by exactly the
 * keyboard's height. So `innerHeight - visualViewport.height - offsetTop`
 * gives the keyboard inset.
 *
 * The chat shell stays statically full-height (its background always covers
 * the whole screen, so a black dead-band is impossible), and the bottom
 * input dock is lifted by `--kb` to float just above the keyboard. Keeping
 * the input inside the visible region means iOS never needs to pan the page
 * to reveal it — which is what previously caused the jump/flicker.
 */
export function useKeyboardInset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;

    const set = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // Snap sub-pixel noise to 0 so a closed keyboard never leaves a 1px gap.
      root.style.setProperty("--kb", `${kb > 1 ? Math.round(kb) : 0}px`);
    };

    set();
    vv.addEventListener("resize", set);
    vv.addEventListener("scroll", set);

    return () => {
      vv.removeEventListener("resize", set);
      vv.removeEventListener("scroll", set);
      root.style.removeProperty("--kb");
    };
  }, []);
}
