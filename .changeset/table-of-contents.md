---
"@toyonix/web-kit": patch
---

New `TableOfContents` component for long articles: a sticky "On this page" column on wide screens (highlighting the current section), and on narrow screens a floating button that opens the list in a menu sliding in from the right. Use it inside the new `.tx-with-toc` layout next to the article. Also: article headings now get `scroll-margin-top`, so anchor jumps land below the sticky header instead of under it.
