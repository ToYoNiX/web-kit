---
"@toyonix/web-kit": patch
---

`SidePanel` can be resized: add `resizable` and the user drags the panel's inner edge (or,
focused, uses the arrow keys, Home and End; Shift for bigger steps). A double-click on the edge
goes back to the `width` you set. Optional `minWidth` / `maxWidth` (default 220 / 720 px) and
`onWidthChange`, called once when a resize ends, so the app can remember the width. Off by
default; narrow screens keep the fixed-width overlay.
