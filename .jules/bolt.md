# Bolt's Journal - Critical Learnings Only

## 2025-02-18 - Idempotent Setup Script Optimization
**Learning:** Idempotent setup scripts that always run system updates and package installations incur significant overhead even when all packages are already present (~4.5s vs ~0.04s). Low-level package query tools (dpkg, rpm, pacman) provide a massive speedup for these "warm" runs.
**Action:** Use `dpkg -s`, `rpm -q`, or `pacman -Qq` to check for package existence before attempting installation.
