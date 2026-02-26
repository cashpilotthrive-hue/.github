## 2026-02-16 - Robust Package Idempotency
**Learning:** For performant and reliable idempotency in apt setup scripts, use `dpkg-query -W $PACKAGES >/dev/null 2>&1` to detect missing packages. This is more robust than parsing the `${Status}` field, as it correctly handles deinstalled (but not purged) packages via exit code. Skipping `apt-get update` and `apt-get install` when all packages are present results in a significant speedup (e.g., ~4.5s down to ~0.06s).
**Action:** Always check for existing packages before running package manager updates/installs in setup scripts.
