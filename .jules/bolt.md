## 2025-05-15 - Setup script idempotency optimization
**Learning:** Checking for package presence using package manager specific query tools (dpkg-query, rpm, pacman -Q) before running the full install/update command provides a massive performance boost (~80-100x) for "already installed" paths. For apt, it is critical to combine 'dpkg-query -W' (for existence) and status verification (for correctness), as 'dpkg-query' only outputs status for known packages.
**Action:** Always implement robust fast-path checks for idempotency in shell scripts that perform system modifications.
