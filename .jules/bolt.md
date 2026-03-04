# Bolt's Performance Journal

## 2026-02-16 - [Shell Package Check Optimization]
**Learning:** Standard package managers (apt, dnf, pacman) take significant time (7-30s) to verify package state even when already installed, due to database locking and metadata checks. Using low-level query tools like `dpkg -s` or `rpm -q` with multiple arguments allows for near-instant (<50ms) verification.
**Action:** Use fast-path checks with low-level package query tools before calling high-level package manager installation commands in idempotent setup scripts.
