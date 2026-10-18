/**
 * The app registry (spec §7): the list of toyonix apps, published by the root site at
 * /registry.json and used for cross-app navigation. The schema is a frozen contract: an
 * incompatible change is a major release and needs a new `version`.
 */

export const REGISTRY_VERSION = 1;

/** Absolute URL of the production registry. Used at build time and in local dev. */
export const REGISTRY_URL = "https://toyonix.github.io/registry.json";

/** Path of the registry on the current origin (root-relative, NOT basePath-relative). */
export const REGISTRY_PATH = "/registry.json";

export type AppStatus = "live" | "beta" | "archived";

export interface RegistryApp {
  /** Repo name = URL slug. */
  id: string;
  title: string;
  description: string;
  /** "/<id>/" */
  path: string;
  status: AppStatus;
  /** Whether the app appears in the shared nav. */
  nav: boolean;
  /** Nav sort key, ascending. */
  order: number;
}

export interface Registry {
  version: typeof REGISTRY_VERSION;
  /** ISO 8601 timestamp of when root generated it. */
  generatedAt: string;
  apps: RegistryApp[];
}

const STATUSES: readonly AppStatus[] = ["live", "beta", "archived"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseApp(value: unknown): RegistryApp | null {
  if (!isRecord(value)) return null;
  const { id, title, description, path, status, nav, order } = value;
  if (typeof id !== "string" || typeof title !== "string" || typeof path !== "string") return null;
  return {
    id,
    title,
    path,
    description: typeof description === "string" ? description : "",
    status: STATUSES.includes(status as AppStatus) ? (status as AppStatus) : "live",
    nav: typeof nav === "boolean" ? nav : true,
    order: typeof order === "number" && Number.isFinite(order) ? order : 100,
  };
}

/**
 * Validates untrusted JSON. Returns null for anything that isn't a v1 registry. Malformed
 * individual entries are dropped rather than failing the whole registry.
 */
export function parseRegistry(value: unknown): Registry | null {
  if (!isRecord(value) || value.version !== REGISTRY_VERSION) return null;
  if (typeof value.generatedAt !== "string" || Number.isNaN(Date.parse(value.generatedAt))) return null;
  if (!Array.isArray(value.apps)) return null;
  const apps = value.apps.map(parseApp).filter((app): app is RegistryApp => app !== null);
  return { version: REGISTRY_VERSION, generatedAt: value.generatedAt, apps };
}

/** True if `candidate` was generated after `current` (or there's no current). */
export function isNewerRegistry(candidate: Registry, current: Registry | null | undefined): boolean {
  if (!current) return true;
  return Date.parse(candidate.generatedAt) > Date.parse(current.generatedAt);
}

/** Apps shown in the shared nav, in display order. */
export function navApps(registry: Registry | null | undefined): RegistryApp[] {
  if (!registry) return [];
  return registry.apps
    .filter((app) => app.nav && app.status !== "archived")
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

/** Fetches and validates a registry. Never throws: returns null on any failure. */
export async function fetchRegistry(
  url: string = REGISTRY_PATH,
  init?: RequestInit,
): Promise<Registry | null> {
  try {
    const response = await fetch(url, { ...init, headers: { accept: "application/json", ...init?.headers } });
    if (!response.ok) return null;
    return parseRegistry(await response.json());
  } catch {
    return null;
  }
}

/**
 * Build-time snapshot of the production registry, baked into each app's static HTML so the
 * nav renders complete with no layout shift. Call it from a server component (e.g. the root
 * layout). Returns null if the registry is unreachable; the nav then fills in at runtime.
 */
export async function getRegistrySnapshot(): Promise<Registry | null> {
  return fetchRegistry(REGISTRY_URL, { signal: AbortSignal.timeout(10_000) });
}
