import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev the browser calls the Vite server (same origin), which forwards the API
// routes to the FastAPI backend — so no CORS dance. Use 127.0.0.1, not localhost,
// because the backend binds IPv4 (see the project's critical-changes note).
const API_BACKEND = "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Everything API-side sits under /api and the prefix is stripped on the way through. It has to
    // be namespaced: /search and /ask are the app's own page routes now, so proxying those paths
    // verbatim would hand the backend every attempt to open those pages.
    proxy: {
      "/api": {
        target: API_BACKEND,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
