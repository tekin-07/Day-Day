import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "scripts/**/*.test.ts", "apps/web/src/**/*.test.ts"],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      "@gungun/core": new URL("./packages/core/src/index.ts", import.meta.url).pathname,
      "@gungun/data": new URL("./packages/data/src/index.ts", import.meta.url).pathname,
    },
  },
});
