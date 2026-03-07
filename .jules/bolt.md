## 2025-05-15 - Idempotent Package Installation
**Learning:** Running `apt-get update` and `apt-get install` unconditionally in a setup script introduces a significant delay (~5s+) even when all packages are present. Using `dpkg-query -W` for APT, `rpm -q` for DNF, and `pacman -Qq` for Pacman allows skipping these expensive operations entirely.
**Action:** Always implement idempotency checks in system setup scripts to ensure they are fast on subsequent runs.
