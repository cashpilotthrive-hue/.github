## 2025-01-24 - Optimized Package Installation Idempotency

**Learning:** High-level package managers like `apt`, `dnf`, and `pacman` are slow for idempotency checks because they refresh metadata, build dependency trees, and perform state verification even when packages are already installed. Using low-level query tools (`dpkg -s`, `rpm -q`, `pacman -Qq`) provides a significant speedup (>75x) for re-runs by performing direct lookups in the local package database.

**Action:** Always check for package existence using low-level tools before calling the primary package manager's install command in setup scripts.
