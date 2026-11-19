import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api/dashboard": {
    target: "http://localhost:8787", rewrite: (path) => path.replace(/^\/api\/dashboard/, ""),
  } } },
});
