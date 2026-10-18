/**
 * Theme preference (light | dark | system), shared by every toyonix app through the
 * `toyonix:shared:theme` storage key. The resolved theme is written to html[data-theme].
 */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_PREFERENCES: readonly ThemePreference[] = ["light", "dark", "system"];

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

/** Applies a resolved theme to the document (no-op outside the browser). */
export function applyResolvedTheme(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

/**
 * Inline script for <head> that sets html[data-theme] before first paint, so there's no flash
 * of the wrong theme. Must stay in sync with storage's key and envelope format; it can't import
 * anything because it runs before any bundle loads.
 */
export const THEME_SCRIPT = `(function(){var p="system";try{var e=JSON.parse(localStorage.getItem("toyonix:shared:theme"));if(e&&e.v===1&&(e.data==="light"||e.data==="dark"||e.data==="system"))p=e.data}catch(_){}try{var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(_){}})();`;
