"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { storage } from "../storage";
import { applyResolvedTheme, resolveTheme, type ResolvedTheme, type ThemePreference } from "../theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribePreference(listener: () => void) {
  return storage.shared.subscribe("theme", listener);
}

function getPreference(): ThemePreference {
  return storage.shared.get("theme") ?? "system";
}

function subscribeSystem(listener: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function getSystemDark(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.(DARK_QUERY).matches;
}

export interface ThemeState {
  /** What the user picked. Shared by every toyonix app. */
  preference: ThemePreference;
  /** What's actually shown. */
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Switches to the opposite of what's shown (an explicit light/dark choice). */
  toggle: () => void;
}

/**
 * The theme preference, synced across tabs and across toyonix apps, applied to html[data-theme].
 * During static rendering and hydration it reports "system"/"light"; the real value follows
 * immediately after (ThemeScript has already painted the right theme).
 */
export function useTheme(): ThemeState {
  const preference = useSyncExternalStore(subscribePreference, getPreference, () => "system" as const);
  const systemDark = useSyncExternalStore(subscribeSystem, getSystemDark, () => false);
  const resolved = resolveTheme(preference, systemDark);

  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    storage.shared.set("theme", next);
  }, []);

  const toggle = useCallback(() => {
    storage.shared.set("theme", resolveTheme(getPreference(), getSystemDark()) === "dark" ? "light" : "dark");
  }, []);

  return { preference, resolved, setPreference, toggle };
}
