## 2026-02-16 - Idempotent Package Installation
**Learning:** Checking for the existence of packages using `dpkg-query -W` (apt), `rpm -q` (dnf), or `pacman -Q` (pacman) before running `update` and `install` commands significantly reduces execution time in warm environments (~149x speedup, from ~41.5s to ~0.28s in some cases). In this environment, it reduced the "no-op" execution from ~4.4s to ~0.03s.
**Action:** Always implement idempotency checks for package manager operations in setup scripts to ensure they are fast when run multiple times.

## 2026-02-16 - Consolidation of Directory Creation
**Learning:** Combining multiple `mkdir -p` calls into a single command reduces process spawning overhead in shell scripts.
**Action:** Consolidate multiple directory creations into a single `mkdir -p` call when possible.
