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
    proxy: {
      "/search": API_BACKEND,
      "/ask": API_BACKEND,
      "/stats": API_BACKEND,
    },
  },
});
