/**
 * @toyonix/web-kit/next: Next.js config integration. Node-only; import it from next.config.ts.
 */
import { execFileSync } from "node:child_process";
import type { NextConfig } from "next";
import { ROOT_APP_ID, normalizeBasePath } from "../env";
import { isRootRepo } from "../slugs";

export interface ResolvedSite {
  /** "" for the root site, otherwise "/<repo>". */
  basePath: string;
  /** "root" for the root site, otherwise the repo name. */
  appId: string;
  /** Which input decided the basePath, for debugging. */
  source: "PAGES_BASE_PATH" | "GITHUB_REPOSITORY" | "git remote" | "default";
}

export interface ResolveOptions {
  /** Defaults to process.env. */
  env?: Record<string, string | undefined>;
  /** Returns the `origin` remote URL, or undefined. Injected for tests. */
  gitRemote?: () => string | undefined;
}

function defaultGitRemote(): string | undefined {
  try {
    return execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

/** "https://github.com/ToYoNiX/gen.git" or "git@github.com:ToYoNiX/gen.git" → "gen". */
export function repoNameFromRemote(remote: string): string | undefined {
  const match = remote.trim().match(/[/:]([^/:]+?)(?:\.git)?\/?$/);
  return match?.[1];
}

function fromRepoName(repo: string): Pick<ResolvedSite, "basePath" | "appId"> {
  return isRootRepo(repo) ? { basePath: "", appId: ROOT_APP_ID } : { basePath: `/${repo}`, appId: repo };
}

/**
 * Works out where this site is served from, with no per-repo config:
 *   1. PAGES_BASE_PATH (set by the deploy workflow from actions/configure-pages)
 *   2. GITHUB_REPOSITORY ("owner/repo", set in GitHub Actions)
 *   3. the `origin` git remote (local dev)
 *   4. "" (root)
 */
export function resolveSite(options: ResolveOptions = {}): ResolvedSite {
  const env = options.env ?? process.env;

  if (env.PAGES_BASE_PATH !== undefined) {
    // configure-pages gives a full path for custom domains too, e.g. "" or "/gen".
    const basePath = normalizeBasePath(env.PAGES_BASE_PATH);
    return { basePath, appId: basePath ? basePath.slice(1) : ROOT_APP_ID, source: "PAGES_BASE_PATH" };
  }

  const repo = env.GITHUB_REPOSITORY?.split("/")[1];
  if (repo) return { ...fromRepoName(repo), source: "GITHUB_REPOSITORY" };

  const remote = (options.gitRemote ?? defaultGitRemote)();
  const remoteRepo = remote ? repoNameFromRemote(remote) : undefined;
  if (remoteRepo) return { ...fromRepoName(remoteRepo), source: "git remote" };

  return { basePath: "", appId: ROOT_APP_ID, source: "default" };
}

/**
 * Wraps a Next config for a toyonix site: static export for GitHub Pages, basePath resolved
 * from the repo, and NEXT_PUBLIC_BASE_PATH / NEXT_PUBLIC_APP_ID baked in for the kit.
 *
 *   // next.config.ts
 *   import { withWebKit } from "@toyonix/web-kit/next";
 *   export default withWebKit({});
 */
export function withWebKit(config: NextConfig = {}, options: ResolveOptions = {}): NextConfig {
  if (config.output !== undefined && config.output !== "export") {
    throw new Error(`withWebKit: toyonix sites are statically exported; remove output: "${config.output}".`);
  }
  if (config.basePath !== undefined) {
    throw new Error("withWebKit: basePath is derived from the repo name; remove it from next.config.");
  }
  if (config.trailingSlash === false) {
    throw new Error("withWebKit: trailingSlash must stay true for GitHub Pages.");
  }

  const site = resolveSite(options);
  return {
    ...config,
    output: "export",
    trailingSlash: true,
    basePath: site.basePath,
    images: { ...config.images, unoptimized: true },
    env: {
      ...config.env,
      NEXT_PUBLIC_BASE_PATH: site.basePath,
      NEXT_PUBLIC_APP_ID: site.appId,
    },
  };
}
