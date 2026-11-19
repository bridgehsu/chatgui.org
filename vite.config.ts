import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub project pages: set VITE_BASE=/repo-name/
// Custom domain or user site: leave default /
const base = process.env.VITE_BASE?.trim() || "/";

export default defineConfig({
  plugins: [react()],
  base,
});
