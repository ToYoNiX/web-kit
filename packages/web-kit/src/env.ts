/**
 * Where this app lives. `withWebKit()` (next.config) bakes both values in at build time as
 * NEXT_PUBLIC_BASE_PATH and NEXT_PUBLIC_APP_ID. The literal `process.env.X` expressions below
 * are what Next replaces, so don't refactor them into a dynamic lookup.
 */

/** The app id of the root site (`toyonix.github.io`). Every other app's id is its repo name. */
export const ROOT_APP_ID = "root";

function readBasePath(): string | undefined {
  try {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  } catch {
    return undefined;
  }
}

function readAppId(): string | undefined {
  try {
    return process.env.NEXT_PUBLIC_APP_ID;
  } catch {
    return undefined;
  }
}

/** Normalizes to "" (root) or "/slug" with no trailing slash. */
export function normalizeBasePath(value: string | undefined | null): string {
  const trimmed = (value ?? "").trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "";
}

/** "" for the root site, otherwise "/<slug>". */
export function getBasePath(): string {
  return normalizeBasePath(readBasePath());
}

/** "root" for the root site, otherwise the repo name. Used to namespace storage. */
export function getAppId(): string {
  const id = readAppId()?.trim();
  if (id) return id;
  const basePath = getBasePath();
  return basePath ? basePath.slice(1) : ROOT_APP_ID;
}

const ABSOLUTE_URL = /^([a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * Prefixes an in-app path with this app's basePath. Use it for raw `<a href>`, `fetch`, and
 * asset URLs; `next/link` and `next/image` already handle basePath.
 * Absolute URLs, hash links, and query-only links are returned unchanged.
 */
export function withBasePath(path: string): string {
  if (ABSOLUTE_URL.test(path) || path.startsWith("#") || path.startsWith("?")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBasePath()}${normalized}`;
}

/**
 * URL of a page in another toyonix app (or this one). Cross-app links are full page loads,
 * so use a plain `<a>` (or `<AppLink>`), never `next/link`.
 *
 * appHref("gen") → "/gen/"; appHref("gen", "/layouts/") → "/gen/layouts/"; appHref("root") → "/"
 */
export function appHref(app: string, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (app === ROOT_APP_ID || app === "") return normalized;
  return `/${app}${normalized}`;
}
