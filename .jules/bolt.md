# Bolt's Performance Journal ⚡

## 2026-02-23 - Package Installation Idempotency
**Learning:** In environment setup scripts, running package manager updates and installs repeatedly is a major bottleneck. Checking for package existence before calling the package manager can reduce "warm" execution time from ~5 seconds to <0.1 seconds.
**Action:** Always implement idempotency checks (e.g., `dpkg-query -W` for apt) before running heavy package management commands in setup scripts.

## 2026-02-23 - Process Spawning Reduction in Shell Scripts
**Learning:** Each shell command (like `mkdir`) spawns a new process. Combining multiple similar operations (like creating several directories) into a single command reduces overhead, providing a measurable speedup especially in frequently called or complex setup workflows.
**Action:** Consolidate multiple `mkdir`, `rm`, `cp`, or similar commands into single calls with multiple arguments when possible.
