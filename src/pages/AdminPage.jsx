import { useAuthStore } from "@/store";
import { AdminGate } from "@/features/admin/AdminGate";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { SelectedWorkAdmin } from "@/features/admin/SelectedWorkAdmin";

/**
 * /admin — JWT-gated dashboard to CRUD the "Selected work" showcase.
 * The token is persisted in useAuthStore, so a refresh keeps you signed in
 * until it expires (12h) or a 401 clears it. Saving asks the backend to commit
 * the data file to GitHub, which auto-deploys on Vercel.
 */
export default function AdminPage() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <AdminGate />;
  return (
    <AdminLayout active="selected-work">
      <SelectedWorkAdmin />
    </AdminLayout>
  );
}
