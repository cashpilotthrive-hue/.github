## 2025-03-03 - [Idempotent Package Installation]
**Learning:** For setup scripts, unconditionally running `apt-get update` and `apt-get install` (even on warm runs) introduces significant latency (6s+). Implementing idempotency using `dpkg-query -W`, `rpm -q`, or `pacman -Qq` before triggering the package manager reduces execution time by ~15x.
**Action:** Always check for missing packages/groups before invoking the package manager in automation scripts to ensure high-speed "warm" runs.
