import { describe, expect, it } from "vitest";
import { isReservedSlug, isRootRepo, isValidSlug, repoToAppId } from "../src/slugs";

describe("slugs", () => {
  it("accepts lowercase kebab-case only", () => {
    expect(isValidSlug("gen")).toBe(true);
    expect(isValidSlug("data-collect-2")).toBe(true);
    for (const bad of ["Gen", "gen_", "-gen", "gen-", "a--b", "", "a.b"])
      expect(isValidSlug(bad)).toBe(false);
  });

  it("knows reserved slugs, case-insensitively", () => {
    expect(isReservedSlug("registry.json")).toBe(true);
    expect(isReservedSlug("ROOT")).toBe(true);
    expect(isReservedSlug("gen")).toBe(false);
  });

  it("maps the <owner>.github.io repo to the root app", () => {
    expect(isRootRepo("toyonix.github.io")).toBe(true);
    expect(isRootRepo("ToYoNiX.github.io")).toBe(true);
    expect(repoToAppId("toyonix.github.io")).toBe("root");
    expect(repoToAppId("gen")).toBe("gen");
  });
});
