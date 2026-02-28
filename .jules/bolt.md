# Bolt's Journal ⚡

## 2025-05-14 - Idempotency in Package Managers
**Learning:** Running `apt-get update` and `apt-get install` even when packages are already present can take several seconds due to cache checks and dependency resolution. Using `dpkg-query -W` (apt), `rpm -q` (dnf), or `pacman -Qq` (pacman) to verify package presence before calling the package manager can reduce execution time by over 99% in "warm" environments.
**Action:** Implement pre-checks in installation scripts to achieve idempotency and speed up repeated runs.
