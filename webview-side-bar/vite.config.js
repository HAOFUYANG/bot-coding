import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // 添加 @ 别名路径
    },
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
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
