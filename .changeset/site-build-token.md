---
"@toyonix/web-kit": patch
---

Site workflows: the build step now gets the read-only `GITHUB_TOKEN` (so the root site's registry build isn't rate-limited by the GitHub API), and `site-deploy` uses least-privilege permissions per job: the build job can only read, and only the deploy job can publish to Pages.
