## 2025-02-27 - Optimized package installation with idempotency checks
**Learning:** Running `apt-get update` and `apt-get install` on every setup run is a major bottleneck (~40s). Using `dpkg-query -W` to check for existing packages allows skipping redundant operations, reducing execution time to <1s in warm environments.
**Action:** Always implement idempotency checks for package managers (apt, dnf, pacman) in setup scripts to ensure they are fast on subsequent runs.
