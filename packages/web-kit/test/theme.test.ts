import { beforeEach, describe, expect, it, vi } from "vitest";
import { THEME_SCRIPT, resolveTheme } from "../src/theme";
import { storage } from "../src/storage";

function mockSystemDark(dark: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: dark && query.includes("dark"),
    addEventListener() {},
    removeEventListener() {},
  }));
}

function runThemeScript() {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- that's what the inline script is
  (new Function(THEME_SCRIPT) as () => void)();
  return document.documentElement.dataset.theme;
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("resolveTheme", () => {
  it("follows the system only for 'system'", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("THEME_SCRIPT", () => {
  it("follows the system with no stored preference", () => {
    mockSystemDark(true);
    expect(runThemeScript()).toBe("dark");
    mockSystemDark(false);
    expect(runThemeScript()).toBe("light");
  });

  it("reads the preference written by the storage API", () => {
    mockSystemDark(true);
    storage.shared.set("theme", "light");
    expect(runThemeScript()).toBe("light");
    mockSystemDark(false);
    storage.shared.set("theme", "dark");
    expect(runThemeScript()).toBe("dark");
  });

  it("ignores garbage and falls back to the system", () => {
    mockSystemDark(false);
    localStorage.setItem("toyonix:shared:theme", "{oops");
    expect(runThemeScript()).toBe("light");
  });
});
