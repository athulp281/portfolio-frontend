import { checkAdminPassword, getSuppliedPassword } from "../_lib/auth.js";

/**
 * POST /api/admin/login  { password }
 * Verifies the admin password so the UI can gate the dashboard. No session
 * token is issued — the client keeps the password in sessionStorage and sends
 * it again on each save (verified server-side every time over HTTPS).
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return res
      .status(500)
      .json({ ok: false, error: "ADMIN_PASSWORD is not configured on the server" });
  }
  const supplied = getSuppliedPassword(req);
  if (!checkAdminPassword(supplied)) {
    return res.status(401).json({ ok: false, error: "Incorrect password" });
  }
  return res.status(200).json({ ok: true });
}
