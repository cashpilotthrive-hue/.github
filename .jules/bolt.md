## 2026-02-19 - [Idempotent Package Installation]
**Learning:** Using low-level package query tools (dpkg-query, rpm, pacman -Q) to check for package presence before invoking the full package manager significantly reduces overhead on warm runs, especially by avoiding unnecessary 'update' calls.
**Action:** Always prefer checking for package existence before calling expensive install/update commands in setup scripts.
