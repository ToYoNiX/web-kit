import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "storage/index": "src/storage/index.ts",
    "registry/index": "src/registry/index.ts",
    "registry/build": "src/registry/build.ts",
    "react/index": "src/react/index.ts",
    "next/index": "src/next/index.ts",
  },
  format: "esm",
  platform: "neutral",
  target: "es2022",
  dts: true,
  // One output file per source module, so per-file "use client" directives survive.
  unbundle: true,
  clean: true,
  deps: { neverBundle: [/^react($|\/)/, /^react-dom($|\/)/, /^next($|\/)/, /^radix-ui($|\/)/, /^node:/] },
  inputOptions: {
    onLog(level, log, handler) {
      // Directives are preserved because of `unbundle`; rolldown warns regardless.
      if (log.code === "MODULE_LEVEL_DIRECTIVE") return;
      handler(level, log);
    },
  },
});
