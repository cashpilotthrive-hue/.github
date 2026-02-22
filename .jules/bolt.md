## 2026-02-20 - Package Installation Idempotency
**Learning:** Calling package managers like `apt`, `dnf`, or `pacman` directly in setup scripts, even when packages are already installed, introduces significant latency (5s+ per run) due to repository synchronization and dependency resolution. Using low-level tools like `dpkg-query`, `rpm -q`, or `pacman -Qq` to verify package existence beforehand can reduce "warm" run times by over 90%.
**Action:** Always implement a pre-check using lightweight query tools before invoking full package manager installation cycles in idempotent scripts.
