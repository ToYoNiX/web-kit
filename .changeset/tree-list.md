---
"@toyonix/web-kit": patch
---

`TreeList`: rows with nesting, such as the layers or parts of a drawing. Items are a flat list
in display order with a `depth`, an optional `leading` symbol and muted `meta`. One row is
selected (`selected` / `onSelect`; ↑/↓, Home and End move it). With `onMove`, rows can be
reordered among their siblings by dragging or with Alt+↑/↓; `onMove(id, index)` gives the new
position among the siblings. An ARIA tree with roving focus.
