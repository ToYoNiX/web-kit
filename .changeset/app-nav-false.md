---
"@toyonix/web-kit": patch
---

`AppShell` no longer adds the current app to the shared header when it is hidden from the nav:
when the registry lists it with `"nav": false`, or when the app passes the new
`appNav={false}` prop (for apps the registry doesn't list yet). Apps with `"nav": false` in
their package.json should pass `appNav={false}`.
