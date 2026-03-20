## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2025-05-15 - Reducing process forks in configuration scripts
**Learning:** Multiple calls to external utilities like `grep` in a loop can significantly slow down scripts due to process fork overhead. Bash's internal regular expression matching (`[[ $var =~ $regex ]]`) is much more efficient.
**Action:** Read configuration files into a variable once and use internal regex matching with `(^|$'\n')` anchors for line-based checks to avoid redundant subshells.
