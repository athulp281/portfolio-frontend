import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { useAdminStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";

/** Password gate for /admin. Unlocks the dashboard on success. */
export function AdminGate() {
  const [password, setPassword] = useState("");
  const login = useAdminStore((s) => s.login);
  const status = useAdminStore((s) => s.status);
  const error = useAdminStore((s) => s.error);
  const loading = status === "loading";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!password || loading) return;
    await login(password);
  };

  return (
    <div className="min-h-[100dvh] grid place-items-center px-6 bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <GlassPanel className="p-8">
          <div className="grid place-items-center size-12 rounded-xl bg-white/5 border border-white/10 mb-6">
            <Lock className="size-5 text-neon-cyan" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Admin access
          </h1>
          <p className="mt-1.5 text-sm text-ink-dim">
            Enter the admin password to manage Selected work.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-bg-soft px-4 py-3 text-sm text-ink outline-none transition focus:border-neon-cyan/60"
            />
            {error && (
              <p className="text-sm text-neon-pink" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Checking…
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </form>
        </GlassPanel>
        <p className="mt-4 text-center text-xs text-ink-mute">
          Session ends when you close this tab.
        </p>
      </motion.div>
    </div>
  );
}
