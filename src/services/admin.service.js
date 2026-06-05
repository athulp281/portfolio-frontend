import { api, unwrap } from "./axios";

/**
 * Admin API — talks to the Express backend. Auth is a JWT obtained from
 * /auth/login and stored in useAuthStore; the axios request interceptor
 * attaches it as `Authorization: Bearer <token>` automatically (along with the
 * shared x-api-key). No secrets live in the frontend.
 *
 * Content is resource-based: /admin/content/<resource> (e.g. "selected-work",
 * "capabilities"), so adding a new admin-managed section needs no new service.
 */

/** Email + password login → returns { token, email }. */
export async function adminLogin(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return unwrap(res); // { token, email }
}

/** Latest committed items for a resource (backend reads them from GitHub). */
export async function fetchContent(resource) {
  const res = await api.get(`/admin/content/${resource}`);
  return unwrap(res)?.items ?? [];
}

/** Commit the items array for a resource (backend → GitHub → Vercel redeploys). */
export async function saveContent(resource, items, message) {
  const res = await api.post(`/admin/content/${resource}`, { items, message });
  return unwrap(res); // { items, commit }
}
