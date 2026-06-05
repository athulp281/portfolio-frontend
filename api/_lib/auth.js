import crypto from "node:crypto";

/**
 * Timing-safe comparison of the supplied admin password against ADMIN_PASSWORD.
 * Returns false (never throws) when the env var is missing so a misconfigured
 * deployment fails closed rather than granting access.
 */
export function checkAdminPassword(supplied) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || typeof supplied !== "string" || supplied.length === 0) {
    return false;
  }
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal lengths; hash both to fixed-size buffers.
  const ah = crypto.createHash("sha256").update(a).digest();
  const bh = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}

/** Pull the admin password from header or JSON body. */
export function getSuppliedPassword(req) {
  const header = req.headers["x-admin-password"];
  if (typeof header === "string" && header.length) return header;
  if (req.body && typeof req.body.password === "string") return req.body.password;
  return "";
}
