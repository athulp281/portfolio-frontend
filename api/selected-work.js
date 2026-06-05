import { checkAdminPassword, getSuppliedPassword } from "./_lib/auth.js";
import { githubConfig, readDataFile, writeDataFile } from "./_lib/github.js";
import { validateItems } from "./_lib/validate.js";

/**
 * /api/selected-work
 *   GET  -> latest committed work items (read live from GitHub so the admin
 *           never shows a stale list while a deploy is in flight). Public.
 *   POST -> { password, items, message? } validate + commit to GitHub, which
 *           triggers a Vercel production deploy. Password-protected.
 */
export default async function handler(req, res) {
  const cfg = githubConfig();
  if (cfg.missing.length) {
    return res.status(500).json({
      ok: false,
      error: `Server missing env: ${cfg.missing.join(", ")}`,
    });
  }

  if (req.method === "GET") {
    try {
      const { items } = await readDataFile();
      return res.status(200).json({ ok: true, items });
    } catch (err) {
      return res.status(502).json({ ok: false, error: String(err.message || err) });
    }
  }

  if (req.method === "POST") {
    if (!process.env.ADMIN_PASSWORD) {
      return res
        .status(500)
        .json({ ok: false, error: "ADMIN_PASSWORD is not configured on the server" });
    }
    if (!checkAdminPassword(getSuppliedPassword(req))) {
      return res.status(401).json({ ok: false, error: "Incorrect password" });
    }

    const body = req.body || {};
    const result = validateItems(body.items);
    if (!result.ok) {
      return res.status(400).json({ ok: false, error: result.error });
    }

    try {
      const commit = await writeDataFile(result.items, body.message);
      return res.status(200).json({
        ok: true,
        items: result.items,
        commit,
      });
    } catch (err) {
      return res.status(502).json({ ok: false, error: String(err.message || err) });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
