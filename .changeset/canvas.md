---
"@toyonix/web-kit": patch
---

`Canvas`: a drawing surface for tool pages. SVG content in world units (e.g. mm), panned with
the `tool="pan"` mode, middle-drag or Space+drag, and zoomed with the wheel around the pointer
(or `wheel="pan"` to scroll, Ctrl+wheel and pinch to zoom), over a dot grid that thins out when
zoomed out. It fits `bounds` until the user moves the view, can be controlled (`view` /
`onViewChange`), reports the pointer in world units (`onCursorMove`), and its `ref` has
`fit()`, `zoomIn()`, `zoomOut()` and `toWorld()`.

For what apps draw on it: `useCanvasDrag` (drag distances in world units, snapped, Shift for free
movement, Escape cancels), `useCanvas`, `snapTo`, handles that keep their size on screen
(`CanvasResizeHandle`, `CanvasCornerHandle`, `CanvasLabel`), and the classes
`tx-canvas__ink`, `__ref`, `__selected` and `__ghost`.
