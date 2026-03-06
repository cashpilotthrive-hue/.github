# Bolt's Journal - Critical Learnings

## 2025-05-14 - Reliable Package Check on Ubuntu 24.04 (Noble)
**Learning:** `dpkg-query -W` may return exit code 0 even if a package is in a 'not-installed' or 'config-files' state. For reliable idempotency, it is necessary to check the `${Status}` field explicitly.
**Action:** Use `dpkg-query -W -f='${Status}' "$pkg" 2/dev/null | grep -q 'ok installed'` to verify package presence.

## 2025-05-14 - Performance Gain from Idempotency in Setup Scripts
**Learning:** Checking for already-installed packages before running `apt-get update` and `apt-get install` provides a ~10x speedup for warm runs (from ~7.6s to ~0.7s) in the current environment by avoiding network calls and package database locks.
**Action:** Always implement local checks before calling remote package manager update/install commands in setup scripts.
