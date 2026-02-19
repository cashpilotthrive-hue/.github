# Bolt's Journal ⚡

## 2026-02-16 - Idempotent Package Installation
**Learning:** Calling package managers like `apt-get`, `dnf`, or `pacman` even for already installed packages introduces significant overhead (multiple seconds) due to database locks, cache refreshes, and dependency resolution. Low-level query tools like `dpkg-query`, `rpm`, or `pacman -Qq` can verify package presence in milliseconds.
**Action:** Implement idempotency checks using low-level tools before invoking the main package manager. Skip `update` and `install` steps if all required packages are already present. Skip group packages in low-level checks as they are not typically supported; use representative individual packages instead.

## 2026-02-19 - [Enhanced Single-Call Package Check]
**Learning:** For `apt`, we can further optimize the idempotency check by using a single call to `dpkg-query` for all packages and comparing the count of correctly installed packages. This avoids multiple shell loops or duplicate calls to `dpkg-query`.
**Action:** Use `INSTALLED_COUNT=$(dpkg-query -W -f='${Status}\n' "${PACKAGES[@]}" 2>/dev/null | grep -x "install ok installed" | wc -l)` and compare with `${#PACKAGES[@]}`.
