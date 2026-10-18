/**
 * @toyonix/web-kit: framework-free core. No React, no Next. Safe to import anywhere.
 */
export { ROOT_APP_ID, appHref, getAppId, getBasePath, normalizeBasePath, withBasePath } from "./env";
export { RESERVED_SLUGS, isReservedSlug, isRootRepo, isValidSlug, repoToAppId } from "./slugs";
export {
  THEME_PREFERENCES,
  THEME_SCRIPT,
  applyResolvedTheme,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme";
