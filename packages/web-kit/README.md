# @toyonix/web-kit

Shared design system, components, and tooling for toyonix static sites (Next.js static export on
GitHub Pages). New sites should start from the `web-starter` template, which wires all of this up.

## Setup

```ts
// next.config.ts
import { withWebKit } from "@toyonix/web-kit/next";
export default withWebKit({}); // static export, basePath from the repo name
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@toyonix/web-kit/tailwind.css";
```

```tsx
// app/layout.tsx
import { AppShell, ThemeScript } from "@toyonix/web-kit/react";
import { getRegistrySnapshot } from "@toyonix/web-kit/registry";
import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppShell registry={await getRegistrySnapshot()}>{children}</AppShell>
      </body>
    </html>
  );
}
```

Configs: `export { default } from "@toyonix/web-kit/eslint"` (eslint.config.mjs),
`export { default } from "@toyonix/web-kit/prettier"` (prettier.config.mjs), and
`"extends": "@toyonix/web-kit/tsconfig.json"`.

## Entry points

| Import                                                   | What                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `@toyonix/web-kit`                                       | `withBasePath`, `appHref`, `getAppId`, slugs, theme helpers     |
| `@toyonix/web-kit/react`                                 | `AppShell`, `ThemeScript`, `useTheme`, components               |
| `@toyonix/web-kit/storage`                               | namespaced `storage.app` / `storage.session` / `storage.shared` |
| `@toyonix/web-kit/registry`                              | registry types, `getRegistrySnapshot`, `fetchRegistry`          |
| `@toyonix/web-kit/registry/build`                        | `buildRegistry` (root site only, Node)                          |
| `@toyonix/web-kit/next`                                  | `withWebKit` for next.config                                    |
| `@toyonix/web-kit/css`                                   | all CSS without Tailwind (works in plain HTML)                  |
| `@toyonix/web-kit/tailwind.css`                          | all CSS + Tailwind theme mapped to the tokens                   |
| `@toyonix/web-kit/eslint`, `/prettier`, `/tsconfig.json` | shared configs                                                  |

## Rules for sites

- Use tokens (`bg-surface`, `text-accent-text`, `var(--tx-accent)`), never hard-coded colors.
  Tailwind's default palette is removed on purpose.
- Use `storage` for localStorage/sessionStorage/IndexedDB names; every app shares one origin.
- In-app links: `next/link`. Links to other toyonix apps: `<AppLink app="gen">` or `appHref()`.
- Don't copy kit components into a site. If something is missing, add it to the kit.

## License

MIT. Bundled fonts (Newsreader, Space Grotesk, Space Mono) are under the SIL Open Font License
1.1; see `dist/css/fonts/LICENSE-*.txt`.
