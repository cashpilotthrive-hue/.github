## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2025-05-15 - Multiline regex anchoring in Bash
**Learning:** In Bash, the `^` anchor in `[[ $var =~ ^regex ]]` matches the start of the entire string, not each line. To match the start of any line in a multiline variable, use `(^|$'\n')` as a prefix.
**Action:** Use `regex="(^|${NEWLINE})[[:space:]]*alias[[:space:]]+${name}"` for line-by-line matching within a Bash variable.
