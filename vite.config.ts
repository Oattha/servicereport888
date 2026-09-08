import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        //service: resolve(__dirname, "service/index.html"),
      },
    },
  },
  server: {
    host: "127.0.0.1",
    proxy: {
      "/service-api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/service-api/, ""),
      },
    },
  },
});
