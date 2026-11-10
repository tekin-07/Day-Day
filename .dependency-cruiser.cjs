module.exports = {
  forbidden: [
    {
      name: "core-pure",
      severity: "error",
      from: { path: "^packages/core/src" },
      to: { path: "^(apps/|packages/data/|.*node_modules/(react|dexie))" },
    },
    {
      name: "data-no-web",
      severity: "error",
      from: { path: "^packages/data/src" },
      to: { path: "^apps/" },
    },
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
    {
      name: "package-entrypoints",
      severity: "error",
      from: { path: "^apps/" },
      to: { path: "^packages/(core|data)/src/(?!index.ts)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: { conditionNames: ["import", "default"] },
  },
};
