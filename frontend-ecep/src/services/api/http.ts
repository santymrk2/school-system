import axios from "axios";

export const BASE = "http://localhost:8080";
//process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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
      // eslint-disable-next-line no-console
      console.log(
        "[API]",
        method,
        url,
        params ? { params } : "",
        "→",
        res.status,
        Array.isArray(res.data) ? "(items: " + res.data.length + ")" : res.data,
      );
      return res;
    },
    (err) => {
      const cfg = err && err.config;
      const method = cfg && cfg.method ? cfg.method.toUpperCase() : "";
      const url = (cfg && cfg.url) || "";
      // eslint-disable-next-line no-console
      console.error(
        "[API][ERR]",
        method,
        url,
        cfg && cfg.params ? { params: cfg.params } : "",
        "→",
        err?.response?.status,
        err?.response?.data ?? err?.message,
      );
      return Promise.reject(err);
    },
  );
}
