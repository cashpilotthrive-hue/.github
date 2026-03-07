
## 2026-03-07 - Idempotency and I/O Optimization in Setup Scripts
**Learning:** Redundant package manager updates and installs are the primary bottleneck in setup scripts (~48s vs ~0.4s). Robust status checks with `dpkg-query`, `rpm`, and `pacman` enable safe skipping of these operations. Consolidating file appends into a single heredoc minimizes system call overhead.
**Action:** Always implement package-level existence checks before triggering package manager execution. Use heredocs for multi-line file modifications.
