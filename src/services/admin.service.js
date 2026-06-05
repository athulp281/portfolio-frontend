import { api, unwrap } from "./axios";

/**
 * Admin API — talks to the Express backend. Auth is a JWT obtained from
 * /auth/login and stored in useAuthStore; the axios request interceptor
 * attaches it as `Authorization: Bearer <token>` automatically (along with the
 * shared x-api-key). No secrets live in the frontend.
 */

/** Email + password login → returns { token, email }. */
export async function adminLogin(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return unwrap(res); // { token, email }
}

/** Latest committed work items (backend reads them from GitHub). */
export async function fetchSelectedWork() {
  const res = await api.get("/admin/selected-work");
  return unwrap(res)?.items ?? [];
}

/** Commit the items array (backend → GitHub → Vercel redeploys). */
export async function saveSelectedWork(items, message) {
  const res = await api.post("/admin/selected-work", { items, message });
  return unwrap(res); // { items, commit }
}
