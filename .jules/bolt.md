# Bolt's Journal - Performance Optimizations

## 2026-02-16 - Idempotency in Package Installation
**Learning:** `apt-get update` and `apt-get install` add significant overhead even when all packages are already installed, taking ~4.7s in this environment. By checking for package presence via `dpkg-query` before triggering these commands, we can reduce "warm" run time to <0.5s.
**Action:** Always implement idempotency checks for system package managers to avoid redundant I/O and network requests. For `apt`, use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q "ok installed"`.
