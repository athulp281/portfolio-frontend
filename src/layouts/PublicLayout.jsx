import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
const NAV_LINKS = [
  { href: "#intro",    label: "About",  targetProgress: 0.50 },
  { href: "#skills",   label: "Skills", targetProgress: 0.58 },
  { href: "#projects", label: "Work",   targetProgress: 0 },
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
  const handleNavClick = (e, link) => {
    e.preventDefault();
    const id = link.href.replace("#", "");
    scrollToSection(id, link.targetProgress);
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
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative inline-flex shrink-0">
            {/* Soft neon halo behind the avatar */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full blur-md opacity-70 bg-gradient-to-br from-neon-cyan to-neon-violet"
            />
            {/* Gradient ring + image */}
            <span className="relative size-9 rounded-full p-[2px] bg-gradient-to-br from-neon-cyan via-neon-violet to-neon-pink shadow-neon">
              <span className="block size-full rounded-full overflow-hidden bg-bg ring-1 ring-white/10">
                <img
                  src="/profile5.png"
                  alt="Athul P"
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </span>
            </span>
            {/* Online status dot */}
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-neon-cyan ring-2 ring-bg shadow-[0_0_8px_rgba(34,211,238,0.9)]"
            />
          </span>
          <span className="font-display tracking-tight text-lg">
            Athion<span className="text-gradient">.ai</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-dim">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className="hover:text-ink transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          to="/chat"
          className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink glass neon-border hover:shadow-neon transition-shadow"
        >
          <Sparkles className="size-4 text-neon-cyan" />
          Talk with my AI
        </Link>
      </div>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-mute">
        <p>© {new Date().getFullYear()} Athul P · Built with Athion AI</p>
        <p className="font-mono text-xs">v0.1 · cinematic mode</p>
      </div>
    </footer>
  );
}
