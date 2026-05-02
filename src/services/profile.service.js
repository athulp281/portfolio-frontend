import { api, unwrap } from "./axios";

export async function fetchPersonalDetails() {
  const res = await api.get("/profile/get-personal-details");
  return unwrap(res);
}

export async function fetchSocialDetails() {
  const res = await api.get("/profile/get-social-details");
  return unwrap(res);
}
