/**
 * Generates the registry from GitHub (spec §7). Used only by the root site at build time, e.g.
 * in app/registry.json/route.ts with `export const dynamic = "force-static"`.
 *
 * Source of truth: public, non-archived repos owned by `owner` with the `topic` topic. Per-app
 * metadata comes from the optional "toyonix" field in each repo's package.json.
 */
import { REGISTRY_VERSION, type AppStatus, type Registry, type RegistryApp } from "./index";
import { isReservedSlug, isRootRepo, isValidSlug } from "../slugs";

export const SITE_TOPIC = "toyonix-site";

export interface BuildRegistryOptions {
  /** GitHub user or org that owns the sites, e.g. "ToYoNiX". */
  owner: string;
  /** Repo topic that marks a site. Defaults to "toyonix-site". */
  topic?: string;
  /** GitHub token (GITHUB_TOKEN in Actions). Optional, but unauthenticated calls are rate-limited. */
  token?: string;
  /** Injected for tests. */
  fetch?: typeof fetch;
  /** Injected for tests. Defaults to the current time. */
  now?: Date;
}

/** The optional "toyonix" field in a site's package.json. */
export interface SiteMetadata {
  title?: string;
  description?: string;
  nav?: boolean;
  order?: number;
  status?: AppStatus;
}

interface RepoSummary {
  name: string;
  description: string | null;
  archived: boolean;
  fork: boolean;
  private: boolean;
  default_branch: string;
}

export class RegistryBuildError extends Error {
  override name = "RegistryBuildError";
}

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function buildRegistry(options: BuildRegistryOptions): Promise<Registry> {
  const { owner, topic = SITE_TOPIC, token, now = new Date() } = options;
  const doFetch = options.fetch ?? fetch;
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };

  const repos: RepoSummary[] = [];
  for (let page = 1; ; page++) {
    const query = encodeURIComponent(`topic:${topic} user:${owner}`);
    const response = await doFetch(
      `https://api.github.com/search/repositories?q=${query}&per_page=100&page=${page}`,
      { headers },
    );
    if (!response.ok) {
      throw new RegistryBuildError(`GitHub search failed: ${response.status} ${response.statusText}`);
    }
    const body = (await response.json()) as { items: RepoSummary[]; total_count: number };
    repos.push(...body.items);
    if (body.items.length < 100 || repos.length >= body.total_count) break;
  }

  const sites = repos.filter(
    (repo) => !repo.archived && !repo.fork && !repo.private && !isRootRepo(repo.name),
  );

  const problems: string[] = [];
  for (const repo of sites) {
    if (!isValidSlug(repo.name)) problems.push(`"${repo.name}" is not a lowercase-kebab slug`);
    if (isReservedSlug(repo.name)) problems.push(`"${repo.name}" is a reserved slug`);
  }
  const lower = sites.map((repo) => repo.name.toLowerCase());
  for (const [i, name] of lower.entries()) {
    if (lower.indexOf(name) !== i) problems.push(`"${name}" appears more than once`);
  }
  if (problems.length) throw new RegistryBuildError(`Invalid site repos:\n- ${problems.join("\n- ")}`);

  const apps = await Promise.all(
    sites.map(async (repo): Promise<RegistryApp> => {
      const meta = await readSiteMetadata(doFetch, headers, owner, repo);
      return {
        id: repo.name,
        title: meta.title ?? titleCase(repo.name),
        description: meta.description ?? repo.description ?? "",
        path: `/${repo.name}/`,
        status: meta.status ?? "live",
        nav: meta.nav ?? true,
        order: meta.order ?? 100,
      };
    }),
  );
  apps.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

  return { version: REGISTRY_VERSION, generatedAt: now.toISOString(), apps };
}

async function readSiteMetadata(
  doFetch: typeof fetch,
  headers: Record<string, string>,
  owner: string,
  repo: RepoSummary,
): Promise<SiteMetadata> {
  const url = `https://api.github.com/repos/${owner}/${repo.name}/contents/package.json?ref=${encodeURIComponent(repo.default_branch)}`;
  const response = await doFetch(url, { headers: { ...headers, accept: "application/vnd.github.raw+json" } });
  if (response.status === 404) return {};
  if (!response.ok) {
    throw new RegistryBuildError(`Reading ${repo.name}/package.json failed: ${response.status}`);
  }
  let pkg: unknown;
  try {
    pkg = await response.json();
  } catch {
    throw new RegistryBuildError(`${repo.name}/package.json is not valid JSON`);
  }
  const raw = (pkg as { toyonix?: unknown }).toyonix;
  if (typeof raw !== "object" || raw === null) return {};
  const meta = raw as Record<string, unknown>;
  const statuses: AppStatus[] = ["live", "beta", "archived"];
  return {
    title: typeof meta.title === "string" ? meta.title : undefined,
    description: typeof meta.description === "string" ? meta.description : undefined,
    nav: typeof meta.nav === "boolean" ? meta.nav : undefined,
    order: typeof meta.order === "number" ? meta.order : undefined,
    status: statuses.includes(meta.status as AppStatus) ? (meta.status as AppStatus) : undefined,
  };
}
