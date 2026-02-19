# Bolt's Journal ⚡

## 2026-02-19 - [Package Install Idempotency]
**Learning:** Standard package manager commands like `apt-get install` can take several seconds (4.9s in this environment) even when all packages are already installed, due to repository metadata checks and internal dependency resolution. Using low-level tools like `dpkg-query -W` allows for near-instant (0.02s) verification of package presence, enabling a significant speedup for "warm" runs.
**Action:** Use `dpkg-query -W -f='${Status}\n'` for `apt` to distinguish between "installed" and "config-files" (rc) states. For `dnf`, use `rpm -q`, and for `pacman`, use `pacman -Qq`.
