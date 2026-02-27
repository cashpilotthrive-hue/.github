## 2025-02-27 - [Idempotent Package Installation]
**Learning:** Shell scripts that run `apt-get update` and `apt-get install` on every execution incur significant unnecessary overhead (~5-10s per run) even when packages are present. Using `dpkg-query -W` (for apt), `rpm -q` (for dnf), or `pacman -Qq` (for pacman) to check for package presence allows skipping these operations, reducing warm run time to <0.1s.
**Action:** Always implement package presence checks before invoking package manager update/install cycles in setup scripts.
