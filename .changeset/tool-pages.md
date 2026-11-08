---
"@toyonix/web-kit": patch
---

Tool pages: everything an editor-style app needs, in the kit's look.

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
