## 2026-01-14 - [Idempotent Package Installation]
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` can return exit code 0 even if a package is not fully installed (e.g., in 'config-files' or 'not-installed' state). For reliable idempotency, the package status must be explicitly checked.
**Action:** Use `dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"` to verify package presence on Debian-based systems.
