import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const { VITE_SERVER_URL = "", VITE_SECRET_KEY = "" } = env;

  return {
    plugins: [react()],
    envDir: "./",
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    define: {
      "process.env": {
        NODE_ENV: JSON.stringify(mode),
        VITE_SERVER_URL: JSON.stringify(VITE_SERVER_URL),
        VITE_SECRET_KEY: JSON.stringify(VITE_SECRET_KEY),
      },
    },
    server: {
      host: "0.0.0.0",
      port: parseInt(env.VITE_PORT || "3000", 10),
      proxy: {
        "/api": {
          target: VITE_SERVER_URL,
          changeOrigin: true,
        },
        "/uploads": {
          target: VITE_SERVER_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
