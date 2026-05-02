import axios from "axios";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const apiKey = useAuthStore.getState().apiKey;
    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    // Surface the toast / banner via UI store so callers don't each have to
    useUIStore.getState().pushToast({
      kind: "error",
      title: status ? `Error ${status}` : "Network error",
      message,
    });

    if (status === 401 || status === 403) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);

/**
 * Backend wraps payloads as { status, message, data, meta }.
 * Use this to unwrap.
 */
export const unwrap = (res) => res?.data?.data;
