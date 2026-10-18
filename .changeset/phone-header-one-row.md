---
"@toyonix/web-kit": patch
---

Fix the `AppShell` header on phones: it stays on one row. The header is more compact on narrow screens so the app links fit next to the logo; when there are too many, they scroll sideways and the current app is scrolled into view (instead of always moving to a second row, as in 0.1.2).
