import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { offlineBuild } from "../../scripts/offline-build.ts";
export default defineConfig({
  root: new URL(".", import.meta.url).pathname,
  base: process.env.VITE_BASE || "/",
  plugins: [tailwindcss(), offlineBuild()],
  oxc: { jsx: { runtime: "automatic" } },
  build: { target: "es2022" },
  server: { host: "127.0.0.1" },
});
