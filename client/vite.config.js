import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootModules = path.resolve(__dirname, "..", "node_modules");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@mui/icons-material": path.join(rootModules, "@mui/icons-material"),
      "@mui/material": path.join(rootModules, "@mui/material"),
      "@emotion/react": path.join(rootModules, "@emotion/react"),
      "@emotion/styled": path.join(rootModules, "@emotion/styled")
    }
  },
  server: {
    port: 5173
  }
});
