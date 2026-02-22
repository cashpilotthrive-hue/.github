# ⚡ Bolt's Journal

## 2026-02-20 - Package Installation Idempotency Optimization
**Learning:** Using low-level package manager query tools (`dpkg-query`, `rpm -q`, `pacman -Qq`) to check for package presence before triggering full updates/installs provides a significant speedup (measured ~67x on apt-based systems). This avoids redundant network calls and repository index refreshes.
**Action:** Always implement a "check-before-update" pattern in shell-based installation scripts to improve developer experience in warm environments.
