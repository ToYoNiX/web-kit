# @toyonix/web-kit

## 0.1.1

### Patch Changes

- [#5](https://github.com/ToYoNiX/web-kit/pull/5) [`07124f7`](https://github.com/ToYoNiX/web-kit/commit/07124f718527e415da7c7379d8f5d2484929ac72) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - Article typography (`Prose` / `.tx-prose`) now styles images (bordered, hard shadow, responsive) and horizontal rules (a short accent marker bar as a section break).

- [#3](https://github.com/ToYoNiX/web-kit/pull/3) [`256ff9d`](https://github.com/ToYoNiX/web-kit/commit/256ff9d6fcaf26c2a020d142510e1a5fa21147e9) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - Site workflows: the build step now gets the read-only `GITHUB_TOKEN` (so the root site's registry build isn't rate-limited by the GitHub API), and `site-deploy` uses least-privilege permissions per job: the build job can only read, and only the deploy job can publish to Pages.

## 0.1.0

### Minor Changes

- [`3220651`](https://github.com/ToYoNiX/web-kit/commit/3220651e877f4bd9cc3bc752389ae0200db59456) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - First release: Zine × Riso design tokens and CSS, self-hosted fonts, Tailwind v4 theme, React components (AppShell, theme, cards, forms, overlays, …), namespaced storage, app registry, `withWebKit()` for Next.js static export, shared ESLint/Prettier/TypeScript configs, and reusable site workflows.
