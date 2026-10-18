import { describe, expect, it } from "vitest";
import { isNewerRegistry, navApps, parseRegistry, type Registry } from "../src/registry";
import { RegistryBuildError, buildRegistry } from "../src/registry/build";

const registry = (generatedAt: string, apps: unknown[] = []) => ({ version: 1, generatedAt, apps });

describe("parseRegistry", () => {
  it("accepts a v1 registry and fills defaults", () => {
    const parsed = parseRegistry(
      registry("2026-10-18T00:00:00Z", [{ id: "gen", title: "Gen", path: "/gen/" }]),
    );
    expect(parsed?.apps).toEqual([
      { id: "gen", title: "Gen", path: "/gen/", description: "", status: "live", nav: true, order: 100 },
    ]);
  });

  it("rejects other versions and shapes", () => {
    expect(parseRegistry(null)).toBeNull();
    expect(parseRegistry({ ...registry("2026-10-18T00:00:00Z"), version: 2 })).toBeNull();
    expect(parseRegistry(registry("not a date"))).toBeNull();
    expect(parseRegistry({ version: 1, generatedAt: "2026-10-18T00:00:00Z", apps: "nope" })).toBeNull();
  });

  it("drops malformed entries but keeps the rest", () => {
    const parsed = parseRegistry(
      registry("2026-10-18T00:00:00Z", [{ id: 1 }, { id: "a", title: "A", path: "/a/" }]),
    );
    expect(parsed?.apps.map((app) => app.id)).toEqual(["a"]);
  });
});

describe("registry helpers", () => {
  it("compares by generatedAt", () => {
    const old = parseRegistry(registry("2026-01-01T00:00:00Z"))!;
    const fresh = parseRegistry(registry("2026-02-01T00:00:00Z"))!;
    expect(isNewerRegistry(fresh, old)).toBe(true);
    expect(isNewerRegistry(old, fresh)).toBe(false);
    expect(isNewerRegistry(old, null)).toBe(true);
  });

  it("lists nav apps in order, without hidden or archived ones", () => {
    const parsed = parseRegistry(
      registry("2026-01-01T00:00:00Z", [
        { id: "b", title: "B", path: "/b/", order: 20 },
        { id: "a", title: "A", path: "/a/", order: 10 },
        { id: "hidden", title: "H", path: "/hidden/", nav: false },
        { id: "old", title: "O", path: "/old/", status: "archived" },
      ]),
    ) as Registry;
    expect(navApps(parsed).map((app) => app.id)).toEqual(["a", "b"]);
  });
});

describe("buildRegistry", () => {
  function fakeGitHub(repos: object[], packages: Record<string, unknown>) {
    return ((input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : input.toString();
      if (url.includes("/search/repositories")) {
        return Promise.resolve(Response.json({ total_count: repos.length, items: repos }));
      }
      const name = url.match(/repos\/[^/]+\/([^/]+)\/contents/)?.[1] ?? "";
      return Promise.resolve(
        name in packages ? Response.json(packages[name]) : new Response("", { status: 404 }),
      );
    }) as typeof fetch;
  }

  const repo = (name: string, extra: object = {}) => ({
    name,
    description: `${name} description`,
    archived: false,
    fork: false,
    private: false,
    default_branch: "main",
    ...extra,
  });

  it("builds apps from repos and package.json metadata", async () => {
    const result = await buildRegistry({
      owner: "ToYoNiX",
      now: new Date("2026-10-18T00:00:00Z"),
      fetch: fakeGitHub(
        [repo("toyonix.github.io"), repo("gen"), repo("data-collect"), repo("old", { archived: true })],
        { gen: { toyonix: { title: "Gen", order: 10, status: "beta" } } },
      ),
    });
    expect(result).toEqual({
      version: 1,
      generatedAt: "2026-10-18T00:00:00.000Z",
      apps: [
        {
          id: "gen",
          title: "Gen",
          description: "gen description",
          path: "/gen/",
          status: "beta",
          nav: true,
          order: 10,
        },
        {
          id: "data-collect",
          title: "Data Collect",
          description: "data-collect description",
          path: "/data-collect/",
          status: "live",
          nav: true,
          order: 100,
        },
      ],
    });
  });

  it("fails on reserved or invalid slugs", async () => {
    await expect(
      buildRegistry({ owner: "ToYoNiX", fetch: fakeGitHub([repo("registry.json"), repo("Bad_Name")], {}) }),
    ).rejects.toThrow(RegistryBuildError);
  });
});
