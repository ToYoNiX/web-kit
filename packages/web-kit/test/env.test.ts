import { describe, expect, it, vi } from "vitest";
import { appHref, getAppId, getBasePath, normalizeBasePath, withBasePath } from "../src/env";

describe("normalizeBasePath", () => {
  it.each([
    [undefined, ""],
    ["", ""],
    ["/", ""],
    ["gen", "/gen"],
    ["/gen/", "/gen"],
    ["//gen//", "/gen"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeBasePath(input)).toBe(expected);
  });
});

describe("app location", () => {
  it("defaults to the root app", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "");
    expect(getBasePath()).toBe("");
    expect(getAppId()).toBe("root");
  });

  it("reads the values baked in by withWebKit", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/gen");
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "gen");
    expect(getBasePath()).toBe("/gen");
    expect(getAppId()).toBe("gen");
  });

  it("derives the app id from the basePath if only that is set", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/articles");
    vi.stubEnv("NEXT_PUBLIC_APP_ID", "");
    expect(getAppId()).toBe("articles");
  });
});

describe("withBasePath", () => {
  it("prefixes in-app paths", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/gen");
    expect(withBasePath("/data.json")).toBe("/gen/data.json");
    expect(withBasePath("data.json")).toBe("/gen/data.json");
  });

  it("leaves absolute, hash, and query URLs alone", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/gen");
    for (const url of ["https://example.com/x", "//cdn.example.com/x", "mailto:a@b.c", "#top", "?q=1"]) {
      expect(withBasePath(url)).toBe(url);
    }
  });

  it("is a no-op prefix on the root site", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    expect(withBasePath("/about/")).toBe("/about/");
  });
});

describe("appHref", () => {
  it("builds cross-app URLs", () => {
    expect(appHref("gen")).toBe("/gen/");
    expect(appHref("gen", "/layouts/")).toBe("/gen/layouts/");
    expect(appHref("gen", "layouts/")).toBe("/gen/layouts/");
    expect(appHref("root")).toBe("/");
    expect(appHref("root", "/about/")).toBe("/about/");
  });
});
