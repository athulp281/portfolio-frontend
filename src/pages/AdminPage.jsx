import { useState } from "react";
import { useAuthStore } from "@/store";
import { AdminGate } from "@/features/admin/AdminGate";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { SelectedWorkAdmin } from "@/features/admin/SelectedWorkAdmin";
import { CapabilitiesAdmin } from "@/features/admin/CapabilitiesAdmin";

/**
 * /admin — JWT-gated dashboard. The sidebar switches the active section; each
 * section is an independent content panel (Selected Work, Capabilities, …).
 * Saving asks the backend to commit that section's data file to GitHub, which
 * auto-deploys on Vercel.
 */
const PANELS = {
  "selected-work": SelectedWorkAdmin,
  capabilities: CapabilitiesAdmin,
};

export default function AdminPage() {
  const token = useAuthStore((s) => s.token);
  const [active, setActive] = useState("selected-work");

  if (!token) return <AdminGate />;

  const Panel = PANELS[active] || SelectedWorkAdmin;
  return (
    <AdminLayout active={active} onNavigate={setActive}>
      <Panel />
    </AdminLayout>
  );
}
