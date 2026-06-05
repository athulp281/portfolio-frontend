import { useEffect, useState } from "react";
import { useAdminStore } from "@/store";
import { AdminGate } from "@/features/admin/AdminGate";
import { SelectedWorkAdmin } from "@/features/admin/SelectedWorkAdmin";

/**
 * /admin — password-gated dashboard to CRUD the "Selected work" showcase.
 * Saving commits the data file to GitHub, which auto-deploys on Vercel.
 */
export default function AdminPage() {
  const authed = useAdminStore((s) => s.authed);
  const restore = useAdminStore((s) => s.restore);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restore();
    setReady(true);
  }, [restore]);

  if (!ready) return null;
  return authed ? <SelectedWorkAdmin /> : <AdminGate />;
}
