# @toyonix/web-kit

## 0.1.6

### Patch Changes

- [#15](https://github.com/ToYoNiX/web-kit/pull/15) [`bda1a5f`](https://github.com/ToYoNiX/web-kit/commit/bda1a5f776a503efcb0a11730555b14d759e3762) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - 13 more icons for canvas tools and shapes: `HandIcon` (pan), `FitIcon`, `GridIcon`,
  `MagnetIcon` (snap), `RotateIcon`, `LayersIcon`, `CornerIcon` (corner radius),
  `RectangleIcon`, `RoundedRectangleIcon`, `CircleIcon`, `PolygonIcon`, `PillIcon` and `PathIcon`.

- [#15](https://github.com/ToYoNiX/web-kit/pull/15) [`80c8b59`](https://github.com/ToYoNiX/web-kit/commit/80c8b59e737250646d5fd6b524bfa216463fdccd) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - `Canvas`: a drawing surface for tool pages. SVG content in world units (e.g. mm), panned with
  the `tool="pan"` mode, middle-drag or Space+drag, and zoomed with the wheel around the pointer
  (or `wheel="pan"` to scroll, Ctrl+wheel and pinch to zoom), over a dot grid that thins out when
  zoomed out. It fits `bounds` until the user moves the view, can be controlled (`view` /
  `onViewChange`), reports the pointer in world units (`onCursorMove`), and its `ref` has
  `fit()`, `zoomIn()`, `zoomOut()` and `toWorld()`.
  
  For what apps draw on it: `useCanvasDrag` (drag distances in world units, snapped, Shift for free
  movement, Escape cancels), `useCanvas`, `snapTo`, handles that keep their size on screen
  (`CanvasResizeHandle`, `CanvasCornerHandle`, `CanvasLabel`), and the classes
  `tx-canvas__ink`, `__ref`, `__selected` and `__ghost`.

- [#15](https://github.com/ToYoNiX/web-kit/pull/15) [`819b95d`](https://github.com/ToYoNiX/web-kit/commit/819b95daf76bda9c262ae9438ae419b1c18b2fe3) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - `SidePanel` can be resized: add `resizable` and the user drags the panel's inner edge (or,
  focused, uses the arrow keys, Home and End; Shift for bigger steps). A double-click on the edge
  goes back to the `width` you set. Optional `minWidth` / `maxWidth` (default 220 / 720 px) and
  `onWidthChange`, called once when a resize ends, so the app can remember the width. Off by
  default; narrow screens keep the fixed-width overlay.

- [#15](https://github.com/ToYoNiX/web-kit/pull/15) [`d1ebfa3`](https://github.com/ToYoNiX/web-kit/commit/d1ebfa381e19ac659db2c22480bd5f7cd124481a) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - `TreeList`: rows with nesting, such as the layers or parts of a drawing. Items are a flat list
  in display order with a `depth`, an optional `leading` symbol and muted `meta`. One row is
  selected (`selected` / `onSelect`; ↑/↓, Home and End move it). With `onMove`, rows can be
  reordered among their siblings by dragging or with Alt+↑/↓; `onMove(id, index)` gives the new
  position among the siblings. An ARIA tree with roving focus. `moveTreeItem(items, id, index)` applies a move to a
  list of items, for apps that keep the rows in their own state.

## 0.1.5

### Patch Changes

- [#12](https://github.com/ToYoNiX/web-kit/pull/12) [`0baf642`](https://github.com/ToYoNiX/web-kit/commit/0baf642a92ad4297ff58b6c62c008db05e355dfe) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - `AppShell` no longer adds the current app to the shared header when it is hidden from the nav:
  when the registry lists it with `"nav": false`, or when the app passes the new
  `appNav={false}` prop (for apps the registry doesn't list yet). Apps with `"nav": false` in
  their package.json should pass `appNav={false}`.

## 0.1.4

### Patch Changes

- [#10](https://github.com/ToYoNiX/web-kit/pull/10) [`9d6b185`](https://github.com/ToYoNiX/web-kit/commit/9d6b185162d323fa47d60932af9791dc0ca8372c) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - Tool pages: everything an editor-style app needs, in the kit's look.
  
  - `AppShell` gets `layout="app"` (a full-window page: no footer, `main` fills the window and
    doesn't scroll) and `header={false}` (hide the shared header on a work page). Both default to
    the current behavior.
  - `Workspace`, `WorkspaceBody`, `WorkspaceMain`, `SidePanel` (slides closed to a labeled tab,
    same motion as the other drawers; an overlay on narrow screens) and `StatusBar`.
  - `Toolbar`, `ToolbarButton`, `ToolbarSeparator` (arrow-key navigation), `Spacer`.
  - `IconButton` (label shown as a tooltip, optional shortcut, `pressed` for toggles) and `Kbd`.
  - `ToggleGroup` / `ToggleGroupItem` (segmented control).
  - `ContextMenu` (right-click menu) with the same items as `DropdownMenu`; menu items now take
    `icon`, `description`, `shortcut` and `tone="danger"`, plus submenus and checkbox/radio items
    for both menus.
  - Compact sizes: `Button size="sm"`, `IconButton size="sm"`, and the `tx-compact` class for a
    whole area (Toolbar and Workspace use it).
  - `Input` takes a `suffix` such as a unit ("mm", "°").
  - Icons in the kit's line style (`PlusIcon`, `UndoIcon`, `PanelLeftIcon`, … 27 in all).
  - New entry point `@toyonix/web-kit/codemirror`: `toyonixTheme`, a CodeMirror 6 theme and
    syntax colors from the kit's tokens (CodeMirror packages are optional peer dependencies).

## 0.1.3

### Patch Changes

- [#8](https://github.com/ToYoNiX/web-kit/pull/8) [`dab1a32`](https://github.com/ToYoNiX/web-kit/commit/dab1a32fc99127f3757a1c73bf6c0e73ddac1e80) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - Fix the `AppShell` header on phones: it stays on one row. The header is more compact on narrow screens so the app links fit next to the logo; when there are too many, they scroll sideways and the current app is scrolled into view (instead of always moving to a second row, as in 0.1.2).

## 0.1.2

### Patch Changes

- [#6](https://github.com/ToYoNiX/web-kit/pull/6) [`cf836ad`](https://github.com/ToYoNiX/web-kit/commit/cf836adb4557463cc5a79d4cf462cc62254471f7) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - `AppShell` header on narrow screens (≤640px): the app links move to their own row under the logo and scroll sideways when there are many, instead of wrapping awkwardly next to the logo.

- [#6](https://github.com/ToYoNiX/web-kit/pull/6) [`cf836ad`](https://github.com/ToYoNiX/web-kit/commit/cf836adb4557463cc5a79d4cf462cc62254471f7) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - New `TableOfContents` component for long articles: a sticky "On this page" column on wide screens (highlighting the current section), and on narrow screens a floating button that opens the list in a menu sliding in from the right. Use it inside the new `.tx-with-toc` layout next to the article. Also: article headings now get `scroll-margin-top`, so anchor jumps land below the sticky header instead of under it.

## 0.1.1

### Patch Changes

- [#5](https://github.com/ToYoNiX/web-kit/pull/5) [`07124f7`](https://github.com/ToYoNiX/web-kit/commit/07124f718527e415da7c7379d8f5d2484929ac72) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - Article typography (`Prose` / `.tx-prose`) now styles images (bordered, hard shadow, responsive) and horizontal rules (a short accent marker bar as a section break).

- [#3](https://github.com/ToYoNiX/web-kit/pull/3) [`256ff9d`](https://github.com/ToYoNiX/web-kit/commit/256ff9d6fcaf26c2a020d142510e1a5fa21147e9) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - Site workflows: the build step now gets the read-only `GITHUB_TOKEN` (so the root site's registry build isn't rate-limited by the GitHub API), and `site-deploy` uses least-privilege permissions per job: the build job can only read, and only the deploy job can publish to Pages.

## 0.1.0

### Minor Changes

- [`3220651`](https://github.com/ToYoNiX/web-kit/commit/3220651e877f4bd9cc3bc752389ae0200db59456) Thanks [@ToYoNiX](https://github.com/ToYoNiX)! - First release: Zine × Riso design tokens and CSS, self-hosted fonts, Tailwind v4 theme, React components (AppShell, theme, cards, forms, overlays, …), namespaced storage, app registry, `withWebKit()` for Next.js static export, shared ESLint/Prettier/TypeScript configs, and reusable site workflows.
