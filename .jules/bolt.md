## 2026-02-19 - [Idempotent Package Installation]
**Learning:** Using low-level package query tools (dpkg-query, rpm, pacman -Q) to check for package presence before invoking the full package manager significantly reduces overhead on warm runs, especially by avoiding unnecessary 'update' calls.
**Action:** Always prefer checking for package existence before calling expensive install/update commands in setup scripts.

## 2026-02-19 - [CI Stability and Scope]
**Learning:** Netlify CI checks (Pages changed, Header rules, Redirect rules) can fail if specific configuration files and visible content changes are missing, even if the primary task is unrelated. This can lead to a conflict between the "single optimization" goal and the requirement for a passing CI.
**Action:** When CI fails on deployment rules, restore or update the necessary configuration files (netlify.toml, _headers, _redirects, index.html) to stabilize the build, even if it feels like scope creep.
