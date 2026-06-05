import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderGit2,
  Layers,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { useAdminStore, useAuthStore, useUIStore } from "@/store";
import { cn } from "@/utils/cn";

/**
 * Admin shell with a unique animated, collapsible sidebar.
 *
 * Menu is config-driven (NAV) so adding future sections is a one-line change —
 * set `available: true` and render its panel by `active` key. The active
 * indicator is a shared-layout pill that slides between items; on mobile the
 * sidebar is an off-canvas drawer.
 */
const NAV = [
  { key: "selected-work", label: "Selected Work", icon: FolderGit2, available: true },
  { key: "capabilities", label: "Capabilities", icon: Layers, available: true },
  { key: "overview", label: "Overview", icon: LayoutDashboard, available: false },
  { key: "messages", label: "Messages", icon: MessagesSquare, available: false },
  { key: "settings", label: "Settings", icon: Settings, available: false },
];

export function AdminLayout({ active = "selected-work", onNavigate, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useAdminStore((s) => s.logout);
  const email = useAuthStore((s) => s.user?.email);
  const toast = useUIStore((s) => s.pushToast);

  const handleNav = (item) => {
    setMobileOpen(false);
    if (!item.available) {
      toast({ kind: "info", title: `${item.label} — coming soon` });
      return;
    }
    onNavigate?.(item.key);
  };

  return (
    <div className="min-h-[100dvh] bg-bg text-ink">
      {/* mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 grid size-10 place-items-center rounded-xl border border-white/10 bg-bg/80 text-ink backdrop-blur-xl lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-bg-soft/95 backdrop-blur-xl",
          "w-64 transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0",
          collapsed ? "lg:w-[84px]" : "lg:w-64",
        )}
      >
        {/* animated aurora glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            aria-hidden
            className="absolute -left-10 -top-10 size-44 rounded-full bg-neon-cyan/20 blur-3xl"
            animate={{ y: [0, 28, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-10 top-1/3 size-40 rounded-full bg-neon-violet/20 blur-3xl"
            animate={{ y: [0, -24, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* brand */}
        <div className="relative flex h-16 items-center gap-3 px-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet font-display text-sm font-bold text-bg shadow-neon">
            A
          </div>
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all duration-200",
              collapsed && "lg:w-0 lg:opacity-0",
            )}
          >
            <div className="truncate font-display text-sm font-semibold leading-tight">
              Athion
            </div>
            <div className="truncate font-mono text-[10px] uppercase tracking-[0.3em] text-ink-mute">
              Admin
            </div>
          </div>

          {/* mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto grid size-8 place-items-center rounded-lg text-ink-dim hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* collapse toggle (desktop) — floating tab on the edge */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-[68px] z-10 hidden size-6 place-items-center rounded-full border border-white/10 bg-bg-soft text-ink-dim shadow-glass transition hover:text-neon-cyan lg:grid"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn("size-3.5 transition-transform duration-300", collapsed && "rotate-180")}
          />
        </button>

        {/* nav */}
        <nav className="relative mt-4 flex-1 space-y-1.5 px-3">
          {NAV.map((item) => {
            const isActive = item.available && item.key === active;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item)}
                className={cn(
                  "group/nav relative flex w-full items-center rounded-xl px-3 py-2.5 text-sm transition-colors",
                  isActive ? "text-ink" : "text-ink-dim hover:text-ink",
                  !item.available && "opacity-60",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="admin-nav-active"
                    className="absolute inset-0 rounded-xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/20 to-neon-violet/15 shadow-[0_0_20px_-6px_rgba(34,211,238,0.5)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10 grid size-5 shrink-0 place-items-center">
                  <Icon
                    className={cn(
                      "size-[18px] transition-transform duration-300 group-hover/nav:scale-110",
                      isActive && "text-neon-cyan",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "relative z-10 ml-3 flex-1 whitespace-nowrap text-left font-medium transition-all duration-200",
                    collapsed && "lg:ml-0 lg:w-0 lg:overflow-hidden lg:opacity-0",
                  )}
                >
                  {item.label}
                </span>
                {!item.available && !collapsed && (
                  <span className="relative z-10 rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-ink-mute">
                    soon
                  </span>
                )}

                {/* tooltip when collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full z-30 ml-3 hidden -translate-y-0 whitespace-nowrap rounded-lg border border-white/10 bg-bg-panel px-2.5 py-1.5 text-xs text-ink opacity-0 shadow-glass transition-opacity group-hover/nav:opacity-100 lg:block">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* footer: view site + user + logout */}
        <div className="relative space-y-1.5 border-t border-white/10 p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="group/nav flex items-center rounded-xl px-3 py-2.5 text-sm text-ink-dim transition-colors hover:text-ink"
          >
            <span className="grid size-5 shrink-0 place-items-center">
              <ExternalLink className="size-[18px] transition-transform duration-300 group-hover/nav:scale-110" />
            </span>
            <span
              className={cn(
                "ml-3 whitespace-nowrap font-medium transition-all duration-200",
                collapsed && "lg:ml-0 lg:w-0 lg:overflow-hidden lg:opacity-0",
              )}
            >
              View site
            </span>
          </a>

          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-violet to-neon-pink text-xs font-semibold text-bg">
              {(email || "A").charAt(0).toUpperCase()}
            </div>
            <div
              className={cn(
                "min-w-0 flex-1 overflow-hidden transition-all duration-200",
                collapsed && "lg:w-0 lg:opacity-0",
              )}
            >
              <div className="truncate text-xs font-medium text-ink">{email || "Admin"}</div>
              <div className="truncate text-[10px] text-ink-mute">Signed in</div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg text-ink-dim transition hover:bg-neon-pink/10 hover:text-neon-pink",
                collapsed && "lg:hidden",
              )}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div
        className={cn(
          "transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "lg:pl-[84px]" : "lg:pl-64",
        )}
      >
        {children}
      </div>
    </div>
  );
}
