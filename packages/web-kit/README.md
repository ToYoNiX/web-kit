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
| `@toyonix/web-kit/codemirror`                            | `toyonixTheme` for CodeMirror 6 editors                         |
| `@toyonix/web-kit/css`                                   | all CSS without Tailwind (works in plain HTML)                  |
| `@toyonix/web-kit/tailwind.css`                          | all CSS + Tailwind theme mapped to the tokens                   |
| `@toyonix/web-kit/eslint`, `/prettier`, `/tsconfig.json` | shared configs                                                  |

## Tool pages

Editor-style pages (a canvas, panels, a toolbar) fill the window instead of scrolling. Give
that route its own layout with `<AppShell layout="app">` (add `header={false}` to hide the
shared header; then link back to your home page and include `<ThemeToggle>` yourself), and
build the page from the kit:

```tsx
<Workspace>
  <Toolbar aria-label="Project">
    <ToolbarButton asChild>
      <IconButton label="Undo" shortcut="Ctrl Z">
        <UndoIcon />
      </IconButton>
    </ToolbarButton>
    <Spacer />
  </Toolbar>
  <WorkspaceBody>
    <SidePanel side="left" title="Config" open={open} onOpenChange={setOpen}>
      …
    </SidePanel>
    <WorkspaceMain>…</WorkspaceMain>
  </WorkspaceBody>
  <StatusBar>…</StatusBar>
</Workspace>
```

The kit shows shortcuts (`shortcut` props, `<Kbd>`) but never binds keys: the app does.

Side panels can be resizable: the user drags the inner edge, and `onWidthChange` reports the
new width when the drag ends, so you can keep it (e.g. in `storage.app`) and pass it back as
`width`:

```tsx
<SidePanel side="left" title="Config" resizable width={width} onWidthChange={setWidth}>
```

## Rules for sites

- Use tokens (`bg-surface`, `text-accent-text`, `var(--tx-accent)`), never hard-coded colors.
  Tailwind's default palette is removed on purpose.
- Use `storage` for localStorage/sessionStorage/IndexedDB names; every app shares one origin.
- In-app links: `next/link`. Links to other toyonix apps: `<AppLink app="gen">` or `appHref()`.
- Don't copy kit components into a site. If something is missing, add it to the kit.

## License

MIT. Bundled fonts (Newsreader, Space Grotesk, Space Mono) are under the SIL Open Font License
1.1; see `dist/css/fonts/LICENSE-*.txt`.
