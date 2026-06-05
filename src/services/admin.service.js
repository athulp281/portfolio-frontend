/**
 * Admin API — talks to the Vercel serverless functions in `/api`, NOT the
 * Express chat backend. Same-origin fetch (no axios instance / x-api-key).
 */
const BASE = "/api";

async function parse(res) {
  let json = {};
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  if (!res.ok || !json.ok) {
    const err = new Error(json.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json;
}

/** Verify the admin password so the UI can unlock. */
export async function adminLogin(password) {
  const res = await fetch(`${BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  await parse(res);
  return true;
}

/** Latest committed work items (read live from GitHub via the function). */
export async function fetchSelectedWork() {
  const res = await fetch(`${BASE}/selected-work`);
  const json = await parse(res);
  return json.items;
}

/** Commit the items array → GitHub → Vercel redeploys. */
export async function saveSelectedWork(items, password, message) {
  const res = await fetch(`${BASE}/selected-work`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
    },
    body: JSON.stringify({ items, message }),
  });
  return parse(res);
}
