## 2025-05-15 - [Optimize package installation with idempotency checks]
**Learning:** Implementing robust package-existence checks (e.g., `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for apt) significantly reduces warm run execution time in setup scripts by bypassing redundant updates and installs.
**Action:** Use native package manager tools to verify presence of packages and groups before triggering updates in any future automation scripts.
