import type { Registry } from "@toyonix/web-kit/registry";

/** Used when the real registry (published by the root site) isn't reachable yet. */
export const demoRegistry: Registry = {
  version: 1,
  generatedAt: "2026-01-01T00:00:00.000Z",
  apps: [
    {
      id: "articles",
      title: "Articles",
      description: "",
      path: "/articles/",
      status: "live",
      nav: true,
      order: 10,
    },
    { id: "gen", title: "Gen", description: "", path: "/gen/", status: "beta", nav: true, order: 20 },
    {
      id: "collect",
      title: "Collect",
      description: "",
      path: "/collect/",
      status: "archived",
      nav: true,
      order: 30,
    },
  ],
};
