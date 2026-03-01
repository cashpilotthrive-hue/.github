# Bolt's Performance Journal

## 2025-05-14 - Package Installation Idempotency
**Learning:** Running `apt-get update` and `apt-get install` unconditionally in setup scripts can waste significant time (e.g., ~4.5 seconds per run) when packages are already installed. Using `dpkg-query -W` for `apt`, `rpm -q` for `dnf`, and `pacman -Qq` for `pacman` allows for rapid checks (0.2s vs 4.7s) to skip unnecessary work.
**Action:** Always implement idempotency checks in provisioning scripts before calling slow package manager operations.

## 2025-05-14 - Portable Benchmarking
**Learning:** Standard tools like `bc` for floating-point math in bash may be missing in minimal environments.
**Action:** Use Python 3 for high-precision timing and calculations in benchmark scripts to ensure portability and accuracy.
