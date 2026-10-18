import { defineConfig } from "eslint/config";
import toyonix from "./packages/web-kit/config/eslint.js";

export default defineConfig([
  ...toyonix,
  {
    // The kit's storage module is the one place allowed to touch browser storage directly.
    files: ["packages/web-kit/src/storage/**", "packages/web-kit/test/**"],
    rules: { "no-restricted-globals": "off", "no-restricted-properties": "off" },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
]);
