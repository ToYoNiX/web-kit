# web-kit

The shared design system, components, configs, and CI for every toyonix static site.

- **Package:** [`@toyonix/web-kit`](packages/web-kit): tokens, CSS, React components, storage,
  app registry, `withWebKit()` for Next.js, and shared ESLint / Prettier / TypeScript configs.
- **Reusable workflows:** [`site-ci.yml`](.github/workflows/site-ci.yml) and
  [`site-deploy.yml`](.github/workflows/site-deploy.yml), called by every site.
- **Dispatcher:** [`sync-sites.yml`](.github/workflows/sync-sites.yml) redeploys every site after
  a kit release (and weekly).
- **Showcase:** [`apps/showcase`](apps/showcase), every component built with the real package.

New sites start from the `web-starter` template. Contributor and agent notes: [AGENTS.md](AGENTS.md).

## Development

```sh
npm ci
npm run build   # build the package
npm run dev     # showcase dev server
npm run check   # everything CI runs
```

## Releasing

1. Add a changeset to your PR: `npm run changeset`.
2. After merge, the release workflow opens a "Release @toyonix/web-kit" PR.
3. Merging that PR publishes to npm, tags the release, and redeploys every site.

### One-time setup

- **npm:** create the `toyonix` org on npmjs.com. Then either publish the first version by
  hand (`npm run build && cd packages/web-kit && npm publish --access public`) and add a
  trusted publisher for it, or add the trusted publisher first if npm allows it for a new
  package. Trusted publisher settings: owner `ToYoNiX`, repository `web-kit`, workflow
  `release.yml`.
- **Dispatcher token:** create a fine-grained personal access token with **Actions: read and
  write** on the site repos and save it as the `SITES_DISPATCH_TOKEN` secret in this repo.
  Note its expiry date.
