# AGENTS.md: web-kit

This repo is `@toyonix/web-kit`, the shared package behind every toyonix static site, plus the
reusable GitHub workflows those sites call. Read this before changing anything. Every site
picks up a kit release automatically, so a mistake here ships everywhere at once.

## The platform in one paragraph

Each toyonix app is its own repo, deployed to GitHub Pages at `toyonix.github.io/<repo>/`
(root `toyonix.github.io` is the landing page). New apps are created from the `web-starter`
template. All apps depend on `@toyonix/web-kit` with a caret range, and their CI runs
`npm update @toyonix/web-kit`, so every deploy uses the newest compatible kit. A kit release
triggers `sync-sites`, which redeploys every site. The full design is in the platform spec
(`~/toyonix-web-platform-spec.md` on the owner's machine).

## Repo layout

```
packages/web-kit/      the published package
  src/css/             tokens.css, base.css, components.css, index.css, tailwind.css
  src/                 core (env, slugs, theme), storage/, registry/, react/, next/
  config/              shared eslint / prettier / tsconfig, published as-is
  scripts/build-css.mjs  copies CSS, generates fonts.css + woff2 from @fontsource
  test/                vitest (jsdom)
apps/showcase/         private Next app: every component, built with the real package
.github/workflows/     ci, release, sync-sites (this repo) + site-ci, site-deploy (reusable)
scripts/sync-sites.mjs the dispatcher that redeploys all sites
```

## Commands

```sh
npm ci
npm run check        # everything CI runs: format, lint, typecheck, tests, kit + showcase build
npm run dev          # showcase dev server (build the kit first: npm run build)
npm run changeset    # record a change (required for any behavior change to the package)
```

## The canary

Every kit PR runs a `canary (web-starter)` CI job: it packs the kit exactly as npm would
publish it, installs that tarball into a fresh checkout of `ToYoNiX/web-starter`, and runs the
site's own `npm run check` (format, lint, typecheck, static build). A red canary means this
change would break sites. Fix the kit; don't weaken the canary.

For an intentional change that needs the template updated too, push a branch with the **same
name** to web-starter. The canary tests against that branch instead of web-starter's `main`.
Merge the web-starter branch first, then the kit PR.

## Stability contract (do not break this)

The kit is consumed by many repos that update automatically. From `1.0`: **no breaking changes
for at least 12 months.** In `0.x`, breaking changes are allowed but only as a minor bump
(see versioning below).

Breaking means any of:

- removing or renaming an export, a CSS class (`tx-*`), or a design token (`--tx-*`)
- changing a component's prop semantics or default behavior in a way that changes existing pages
- changing a storage key, the storage envelope (`{ v: 1, data }`), or a shared key's type
- changing the registry schema incompatibly
- requiring a new peer major (Next, React, Tailwind, ESLint)
- changing reusable workflow inputs/behavior so an existing caller fails

Not breaking (ship freely, as minor in 1.x / patch in 0.x): new exports, components, tokens,
optional props; token _value_ changes (that's how visual refinements reach every site);
bug fixes.

Deprecate, don't remove: keep the old API working until the next major and say so in the
changeset.

## Versioning

- `0.x`: caret ranges only float patches (`^0.1.0` accepts `0.1.9`, not `0.2.0`). So in 0.x
  use **patch** for features and fixes, **minor** for anything breaking. Sites opt into the
  new minor by bumping their range.
- `1.x` and up: normal semver.
- Reusable workflows are referenced by a moving major tag (`@v0`, `@v1`) that the release job
  moves on every publish. Workflow changes reach every site immediately, regardless of the
  site's package range, so keep them backward compatible within the major.

## Layer rules

Dependencies point one way: `css` ← core ← `react` ← `next`.

- `src/css/*`: no JS. Must work in plain HTML (and Hugo) via `@toyonix/web-kit/css`.
- core (`src/index.ts`, `env`, `slugs`, `theme`, `storage`, `registry`): no React, no Next.
- `src/react`: React only, never imports `next/*`. Cross-app links are plain `<a>`; in-app
  links come from the app (use `asChild`).
- `src/next`: Node-only config helpers for `next.config.ts`.
- `registry/build.ts`: Node, root site only.
- Anything not in the `exports` map of `packages/web-kit/package.json` is private.
- Client components start with `"use client"`. The build keeps one output file per module
  (`unbundle`) so these directives survive; don't change that.

## Frozen contracts

- Storage keys: `toyonix:shared:<key>` (kit-defined keys only, see `SharedKeys`) and
  `toyonix:<appId>:<key>`. `THEME_SCRIPT` in `src/theme.ts` reads the theme key directly and
  must stay in sync with the storage format.
- Registry schema v1 (`src/registry/index.ts`).
- `--tx-*` token names and `tx-*` class names.
- `withWebKit()` derives `basePath` from the repo; sites must not set it themselves.

## Design source of truth

The visual direction is "Zine × Riso" (spec §5.2). Token values live in `src/css/tokens.css`;
component styles in `src/css/components.css`. The showcase (`apps/showcase`) must keep
rendering every component. Check it in both themes after visual changes.

## Gotchas

- Tailwind's compiler (Lightning CSS) rewrites `light-dark()` into `--lightningcss-light/dark`
  variables. Theme switching relies on the `[data-theme]` rules setting `color-scheme`; keep
  them in `tokens.css`.
- Tailwind preflight resets list markers, heading sizes and margins. Components must set what
  they need explicitly (see `.tx-prose ol`).
- `env.ts` reads `process.env.NEXT_PUBLIC_BASE_PATH` / `NEXT_PUBLIC_APP_ID` as literal
  expressions so Next can inline them. Don't refactor them into dynamic lookups.
- TypeScript is pinned to 6.0.x and ESLint to 9.x because typescript-eslint and
  eslint-plugin-jsx-a11y (via eslint-config-next) don't support newer majors yet.
