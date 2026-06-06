import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/common/Magnetic";

export function PublicLayout() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Approximate fixed header height in px. Used to offset anchor scrolls
 * so the targeted section's top doesn't slide under the header.
 */
const HEADER_OFFSET = 88;

/**
 * Per-section landing target, expressed as the framer-motion `useScroll`
 * progress value (with `offset: ["start end", "end start"]`) that we want
 * the section to be at after the smooth scroll lands.
 *
 * Why progress, not "fraction of height": framer's progress is
 *
 *     progress = (scroll - (sectionTop - viewportHeight))
 *                / (sectionHeight + viewportHeight)
 *
 * so a "30% into the section" jump maps to a progress that depends on
 * sectionHeight / viewportHeight. The earlier `offsetPct: 0.30` landed
 * at progress ~0.42 on a 300svh Skills section — which is BEFORE the
 * last card (Z-Dolly) finishes entering at progress 0.52, so Card 4
 * was still rendering with `filter: blur(~9px)`. Targeting progress
 * directly puts us inside the cards' rest plateau (0.52–0.66) where
 * every card is at full opacity and 0px blur.
 *
 *   intro:    eyebrow .28-.7 / heading .32-.7 / stats settle by .44 →
 *             target 0.50 (centered, all content at peak)
 *   skills:   eyebrow .28-.7 / heading .36-.66 / cards full at .52-.66 →
 *             target 0.58 (last card past entry, well before exit)
 *   projects: normal flow with content at top → target 0 (just header
 *             offset)
 */
// The landing sections are now normal-flow (no pinned stages), so every
// anchor just snaps the section top under the fixed header — targetProgress 0.
const NAV_LINKS = [
  { href: "#hero",       label: "Home",       targetProgress: 0 },
  { href: "#experience", label: "Experience", targetProgress: 0 },
  { href: "#intro",      label: "About",      targetProgress: 0 },
  { href: "#skills",  label: "Skills",  targetProgress: 0 },
  { href: "#work",    label: "Work",    targetProgress: 0 },
  { href: "#contact", label: "Contact", targetProgress: 0 },
];

function scrollToSection(id, targetProgress = 0) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const currentScroll =
    window.scrollY || document.documentElement.scrollTop || 0;
  const sectionTop = rect.top + currentScroll;
  const sectionHeight = el.offsetHeight;
  const viewportHeight = window.innerHeight;

  // For pinned sections, invert framer's progress formula so the smooth
  // scroll lands at the requested progress value. For top-anchor sections
  // (targetProgress = 0) we just snap the section's top under the header.
  const targetY =
    targetProgress > 0
      ? sectionTop -
        viewportHeight +
        targetProgress * (sectionHeight + viewportHeight) -
        HEADER_OFFSET
      : sectionTop - HEADER_OFFSET;

  const finalY = Math.max(0, targetY);

  // Prefer Lenis when available — native window.scrollTo fights Lenis's
  // own rAF loop and can either skip the animation or land at the wrong
  // position because Lenis is mid-lerp.
  if (window.__lenis) {
    window.__lenis.scrollTo(finalY, { duration: 1.4 });
  } else {
    window.scrollTo({ top: finalY, behavior: "smooth" });
  }
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (e, link) => {
    e.preventDefault();
    setMenuOpen(false);

    // The drawer pauses Lenis + locks body scroll while open. Re-enable both
    // BEFORE scrolling, otherwise lenis.scrollTo is issued while stopped and
    // silently ignored (the "menu link doesn't navigate" bug).
    if (typeof document !== "undefined") document.body.style.overflow = "";
    window.__lenis?.start?.();

    const id = link.href.replace("#", "");
    // Defer a frame so Lenis is running again before the programmatic scroll.
    requestAnimationFrame(() => scrollToSection(id, link.targetProgress));

    if (typeof history !== "undefined" && history.replaceState) {
      history.replaceState(null, "", link.href);
    }
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="relative mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        {/* Logo (left) */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative inline-flex shrink-0">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-md opacity-70 bg-gradient-to-br from-neon-cyan to-neon-violet"
            />
            <span className="relative size-9 rounded-full p-[2px] bg-gradient-to-br from-neon-cyan via-neon-violet to-neon-pink shadow-neon">
              <span className="block size-full rounded-full overflow-hidden bg-bg ring-1 ring-line/10">
                <img
                  src="/profile5.png"
                  alt="Athul P"
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </span>
            </span>
          </span>
          <span className="font-display tracking-tight text-lg">
            Athion<span className="text-gradient">.ai</span>
          </span>
        </Link>

        {/* Centered pill nav (desktop) */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full glass px-2 py-1.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              data-cursor="hover"
              className="px-4 py-1.5 rounded-full text-sm text-ink-dim hover:text-ink hover:bg-line/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5">
          <Magnetic strength={0.4}>
            <Link
              to="/chat"
              aria-label="Talk with my AI"
              data-cursor="hover"
              className="group grid place-items-center size-11 rounded-full glass neon-border hover:shadow-neon transition-shadow"
            >
              <Sparkles className="size-4 text-neon-cyan transition-transform duration-500 group-hover:rotate-12" />
            </Link>
          </Magnetic>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden grid place-items-center size-11 rounded-full glass text-ink"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavClick={handleNavClick}
      />
    </motion.header>
  );
}

/* =========================================================================
 * MobileDrawer — animated right-slide sidebar for the nav links on mobile.
 * ========================================================================= */
const drawerEase = [0.16, 1, 0.3, 1];

function MobileDrawer({ open, onClose, onNavClick }) {
  // Lock page scroll (and pause Lenis) while the drawer is open.
  useEffect(() => {
    if (open) {
      window.__lenis?.stop?.();
      document.body.style.overflow = "hidden";
    } else {
      window.__lenis?.start?.();
      document.body.style.overflow = "";
    }
    return () => {
      window.__lenis?.start?.();
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm md:hidden"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="fixed top-0 right-0 z-50 h-[100dvh] w-[82%] max-w-sm md:hidden flex flex-col bg-bg-soft border-l border-line/10 shadow-glass"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-line/10">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-ink-mute">
                Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid place-items-center size-10 rounded-full glass text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Links */}
            <motion.nav
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
              }}
              className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => onNavClick(e, link)}
                  variants={{
                    hidden: { opacity: 0, x: 28 },
                    show: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.5, ease: drawerEase }}
                  className="group flex items-baseline gap-3 py-3 border-b border-line/10"
                >
                  <span className="font-mono text-xs text-ink-mute w-7">
                    0{i + 1}
                  </span>
                  <span className="font-display font-semibold text-3xl tracking-[-0.02em] text-ink-dim group-hover:text-ink transition-colors">
                    {link.label}
                  </span>
                </motion.a>
              ))}
            </motion.nav>

            {/* CTA */}
            <div className="px-6 pb-8 pt-2">
              <Link
                to="/chat"
                onClick={onClose}
                className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-ink text-bg pl-6 pr-2 py-2.5 text-sm font-medium"
              >
                Talk with my AI
                <span className="grid place-items-center size-9 rounded-full bg-bg text-ink transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/5 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-mute">
        <p>© {new Date().getFullYear()} Athul P · Built with Athion AI</p>
        <p className="font-mono text-xs">v0.1 · cinematic mode</p>
      </div>
    </footer>
  );
}
