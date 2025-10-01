import axios from "axios";

import { logger } from "@/lib/logger";

export const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const http = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = "Bearer " + token;
  }
  config.headers = config.headers || {};
  config.headers["ngrok-skip-browser-warning"] = "true";
  return config;
});

const apiLogger = logger.child({ module: "api/http" });

// DEBUG (solo si NEXT_PUBLIC_DEBUG)
if (process.env.NEXT_PUBLIC_DEBUG) {
  http.interceptors.response.use(
    (res) => {
      const method =
        res.config && res.config.method
          ? res.config.method.toUpperCase()
          : "GET";
      const url = (res.config && res.config.url) || "";
      // @ts-ignore
      const params = res.config && res.config.params;
      apiLogger.debug(
        {
          method,
          url,
          params: params || undefined,
          status: res.status,
          data: Array.isArray(res.data)
            ? { type: "array", length: res.data.length }
            : res.data,
        },
        "API response",
      );
      return res;
    },
    (err) => {
      const cfg = err && err.config;
      const method = cfg && cfg.method ? cfg.method.toUpperCase() : "";
      const url = (cfg && cfg.url) || "";
      apiLogger.error(
        {
          err,
          method,
          url,
          params: cfg && cfg.params ? cfg.params : undefined,
          status: err?.response?.status,
          data: err?.response?.data ?? err?.message,
        },
        "API response error",
      );
      return Promise.reject(err);
    },
  );
}
