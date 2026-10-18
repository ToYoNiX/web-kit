// @toyonix/web-kit/eslint: shared ESLint flat config for toyonix sites.
//
//   // eslint.config.mjs
//   export { default } from "@toyonix/web-kit/eslint";
//
// Next core-web-vitals + TypeScript (including type-aware rules), plus the platform rules:
// storage only through the kit (spec §6) and no deep imports into the kit.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const STORAGE_MESSAGE =
  "All toyonix apps share one origin. Use `storage` from @toyonix/web-kit/storage so keys stay namespaced.";
const COOKIE_MESSAGE =
  "All toyonix apps share one origin. If you really need a cookie, set Path=cookiePath() from @toyonix/web-kit/storage and disable this rule on that line.";

/** The toyonix platform rules on their own, for composing a custom config. */
export const platformRules = defineConfig({
  name: "toyonix/platform",
  rules: {
    // toyonix sites use the App Router; this rule only knows pages/ and warns when it is missing.
    "@next/next/no-html-link-for-pages": "off",
    "no-restricted-globals": [
      "error",
      ...["localStorage", "sessionStorage", "indexedDB"].map((name) => ({ name, message: STORAGE_MESSAGE })),
    ],
    "no-restricted-properties": [
      "error",
      ...["localStorage", "sessionStorage", "indexedDB"].flatMap((property) =>
        ["window", "globalThis", "self"].map((object) => ({ object, property, message: STORAGE_MESSAGE })),
      ),
      { object: "document", property: "cookie", message: COOKIE_MESSAGE },
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@toyonix/web-kit/dist/*", "@toyonix/web-kit/src/*"],
            message:
              "Import from @toyonix/web-kit's public entry points only; internals change without notice.",
          },
        ],
      },
    ],
  },
});

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "toyonix/type-aware",
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommendedTypeCheckedOnly],
    languageOptions: { parserOptions: { projectService: true } },
  },
  platformRules,
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "**/coverage/**",
    "**/next-env.d.ts",
  ]),
]);
