import { ROOT_APP_ID } from "./env";

/**
 * Top-level paths owned by the root site. An app repo with one of these names would collide
 * with root, so the registry build rejects it. Adding an entry is a minor release only if no
 * live app already uses that slug.
 */
export const RESERVED_SLUGS: readonly string[] = Object.freeze([
  ROOT_APP_ID,
  "_next",
  "404",
  "404.html",
  "index.html",
  "registry.json",
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
  "assets",
]);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Lowercase kebab-case, as required for repo names (repo name = URL slug = app id). */
export function isValidSlug(slug: string): boolean {
  return SLUG.test(slug);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

/** True for the root repo (`<owner>.github.io`), which is served at `/`. */
export function isRootRepo(repoName: string): boolean {
  return repoName.toLowerCase().endsWith(".github.io");
}

/** Repo name → app id: "root" for `<owner>.github.io`, otherwise the repo name. */
export function repoToAppId(repoName: string): string {
  return isRootRepo(repoName) ? ROOT_APP_ID : repoName;
}
