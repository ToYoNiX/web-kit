"use client";

import { useEffect, useState } from "react";
import { storage } from "../storage";
import {
  REGISTRY_PATH,
  REGISTRY_URL,
  fetchRegistry,
  isNewerRegistry,
  parseRegistry,
  type Registry,
} from "../registry";

const CACHE_KEY = "registry";

function isLocalDev(): boolean {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/**
 * The app registry. Starts from the build-time `snapshot` (so static HTML has a full nav), then
 * uses the copy cached for this browser session, or fetches /registry.json once per session.
 * In local dev it falls back to the production registry.
 */
export function useRegistry(snapshot?: Registry | null): Registry | null {
  const [registry, setRegistry] = useState<Registry | null>(snapshot ?? null);

  useEffect(() => {
    const adopt = (candidate: Registry | null) => {
      if (candidate) setRegistry((current) => (isNewerRegistry(candidate, current) ? candidate : current));
    };

    const cached = parseRegistry(storage.session.get(CACHE_KEY));
    if (cached) {
      adopt(cached);
      return;
    }

    const controller = new AbortController();
    void (async () => {
      let fresh = await fetchRegistry(REGISTRY_PATH, { signal: controller.signal });
      if (!fresh && isLocalDev() && !controller.signal.aborted) {
        fresh = await fetchRegistry(REGISTRY_URL, { signal: controller.signal });
      }
      if (fresh && !controller.signal.aborted) {
        storage.session.set(CACHE_KEY, fresh);
        adopt(fresh);
      }
    })();
    return () => controller.abort();
  }, []);

  return registry;
}
