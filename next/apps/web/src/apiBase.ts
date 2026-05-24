export const API_BASE =
  import.meta.env.VITE_DSA_DAEMON_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:4777" : window.location.origin);
