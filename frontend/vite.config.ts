import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/node-api': {
        target: process.env.VITE_NODE_TARGET || 'http://13.49.65.231:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/node-api/, '/api')
      },
      '/py-api': {
        target: process.env.VITE_PY_TARGET || 'http://13.49.65.231:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/py-api/, '')
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
