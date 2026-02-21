# Bolt's Journal - Critical Performance Learnings

## 2025-05-14 - [Idempotency and Process Overhead in Setup Scripts]
**Learning:** In setup scripts, calling package managers like `apt` or `dnf` even when packages are already installed introduces significant latency (~6s for apt on a warm run) due to repository update checks and dependency tree building. Using low-level tools like `dpkg-query` to verify installation status beforehand can achieve near-instantaneous results (~0.07s). Additionally, combining multiple shell commands (like `mkdir -p`) reduces the overhead of spawning separate processes.

**Action:** Always implement status-based idempotency checks for external tools in setup/deployment scripts. Batch operations whenever possible to minimize process creation.
