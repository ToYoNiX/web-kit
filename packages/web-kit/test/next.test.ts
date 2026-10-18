import { describe, expect, it } from "vitest";
import { repoNameFromRemote, resolveSite, withWebKit } from "../src/next";

const noGit = () => undefined;

describe("resolveSite", () => {
  it("prefers PAGES_BASE_PATH, including an empty one", () => {
    expect(resolveSite({ env: { PAGES_BASE_PATH: "/gen" }, gitRemote: noGit })).toMatchObject({
      basePath: "/gen",
      appId: "gen",
    });
    expect(
      resolveSite({ env: { PAGES_BASE_PATH: "", GITHUB_REPOSITORY: "ToYoNiX/gen" }, gitRemote: noGit }),
    ).toMatchObject({ basePath: "", appId: "root", source: "PAGES_BASE_PATH" });
  });

  it("falls back to GITHUB_REPOSITORY, then the git remote, then root", () => {
    expect(resolveSite({ env: { GITHUB_REPOSITORY: "ToYoNiX/articles" }, gitRemote: noGit })).toMatchObject({
      basePath: "/articles",
      source: "GITHUB_REPOSITORY",
    });
    expect(
      resolveSite({ env: { GITHUB_REPOSITORY: "ToYoNiX/toyonix.github.io" }, gitRemote: noGit }),
    ).toMatchObject({ basePath: "", appId: "root" });
    expect(resolveSite({ env: {}, gitRemote: () => "git@github.com:ToYoNiX/gen.git" })).toMatchObject({
      basePath: "/gen",
      source: "git remote",
    });
    expect(resolveSite({ env: {}, gitRemote: noGit })).toMatchObject({ basePath: "", source: "default" });
  });
});

describe("repoNameFromRemote", () => {
  it.each([
    ["https://github.com/ToYoNiX/gen.git", "gen"],
    ["https://github.com/ToYoNiX/gen", "gen"],
    ["git@github.com:ToYoNiX/toyonix.github.io.git", "toyonix.github.io"],
    ["ssh://git@github.com/ToYoNiX/web-kit.git", "web-kit"],
  ])("%s → %s", (remote, name) => {
    expect(repoNameFromRemote(remote)).toBe(name);
  });
});

describe("withWebKit", () => {
  const options = { env: { GITHUB_REPOSITORY: "ToYoNiX/gen" }, gitRemote: noGit };

  it("configures a static export for GitHub Pages", () => {
    const config = withWebKit({ reactStrictMode: true, images: { qualities: [75] } }, options);
    expect(config).toMatchObject({
      reactStrictMode: true,
      output: "export",
      trailingSlash: true,
      basePath: "/gen",
      images: { qualities: [75], unoptimized: true },
      env: { NEXT_PUBLIC_BASE_PATH: "/gen", NEXT_PUBLIC_APP_ID: "gen" },
    });
  });

  it("refuses settings that would break the deployment", () => {
    expect(() => withWebKit({ output: "standalone" }, options)).toThrow(/statically exported/);
    expect(() => withWebKit({ basePath: "/x" }, options)).toThrow(/basePath/);
    expect(() => withWebKit({ trailingSlash: false }, options)).toThrow(/trailingSlash/);
  });
});
