import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
  },
  base: "./",
  build: {
    outDir: "../media", //输出目录
    emptyOutDir: true,
    rollupOptions: {
      input: "./index.html",
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          antd: ["antd"],
        },
      },
    },
  },
});
