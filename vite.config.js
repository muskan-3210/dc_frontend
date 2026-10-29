import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The proxy forwards /api calls to the dc_server backend, so no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
