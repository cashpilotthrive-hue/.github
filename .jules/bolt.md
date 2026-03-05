## 2026-02-16 - Idempotency in Package Installation
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages that are in a 'not-installed' state (e.g., 'un' status). For reliable idempotency checks, it's necessary to inspect the `${Status}` field explicitly.
**Action:** Use `dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"` instead of just checking the exit code of `dpkg-query -W`.
