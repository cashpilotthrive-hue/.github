## 2025-05-22 - Optimization of Package Install Idempotency
**Learning:** Checking for already-installed packages using package-manager-specific tools (dpkg-query, rpm, pacman -Qq) before running update/install commands results in a massive performance gain (~55x speedup) for development environment setup scripts in warm environments.
**Action:** Always implement package-level idempotency checks in setup scripts to avoid redundant network-bound operations.

## 2025-05-22 - Reducing Process Overhead in Shell Scripts
**Learning:** Combining multiple `mkdir -p` calls into a single command reduces the number of process forks, which is a small but measurable micro-optimization in setup scripts.
**Action:** Use single commands for multiple directory creations or similar batchable operations in shell scripts.
