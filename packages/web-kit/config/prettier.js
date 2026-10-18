// @toyonix/web-kit/prettier: shared Prettier config for toyonix sites.
//
//   // prettier.config.mjs
//   export { default } from "@toyonix/web-kit/prettier";
//
// The Tailwind plugin sorts class names; it reads the theme from app/globals.css by default.
import * as tailwind from "prettier-plugin-tailwindcss";

/** Builds the config, e.g. when the Tailwind entry stylesheet lives somewhere other than app/globals.css. */
export function createPrettierConfig({ tailwindStylesheet = "./app/globals.css" } = {}) {
  /** @type {import("prettier").Config & { tailwindStylesheet?: string }} */
  const config = {
    printWidth: 110,
    plugins: [tailwind],
    tailwindStylesheet,
  };
  return config;
}

export default createPrettierConfig();
