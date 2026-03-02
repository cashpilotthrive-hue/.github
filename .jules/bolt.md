## 2026-03-02 - Idempotent Package Installation Optimization
**Learning:** Running `apt-get update` and `apt-get install` on a warm system (where all packages are already present) can take ~45 seconds. By using `dpkg-query -W` to check for package existence first, this can be reduced to <0.4 seconds.
**Action:** Always implement a "check-then-install" pattern for system dependencies to avoid redundant package manager overhead in CI and local setup environments.
