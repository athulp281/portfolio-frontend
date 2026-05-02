import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Mounts a Lenis smooth-scroll instance on the window for the lifetime of
 * the component that calls this hook. Framer Motion's `useScroll` reads
 * native scroll events, and Lenis dispatches those after lerping, so every
 * scroll-driven animation in the app inherits the smoothing for free.
 *
 * Internal scrollers (e.g. chat message list) should opt out by adding
 * `data-lenis-prevent` to the scrolling element so wheel events bypass Lenis.
 */
export function useLenis(options) {
  useEffect(() => {
    const lenis = new Lenis({
      // Easing duration — higher = silkier but laggier. 1.2 is the sweet spot.
      duration: 1.25,
      // Bezier-ish ease-out-expo — fast start, soft tail.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // Don't smooth touch — native momentum on mobile feels better than ours.
      syncTouch: false,
      touchMultiplier: 1.4,
      ...options,
    });

    // Expose globally so nav anchor-clicks (and any other component that
    // needs to programmatically scroll) can call lenis.scrollTo with the
    // smoothing rather than fighting Lenis with native window.scrollTo.
    if (typeof window !== "undefined") window.__lenis = lenis;

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (typeof window !== "undefined" && window.__lenis === lenis) {
        delete window.__lenis;
      }
    };
  }, [options]);
}
