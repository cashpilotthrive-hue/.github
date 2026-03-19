## 2025-05-14 - Reliable package status check on Ubuntu 24.04
**Learning:** On Ubuntu 24.04 (Noble), `dpkg-query -W` may return exit code 0 even for packages in 'not-installed' status if they were previously uninstalled but not purged.
**Action:** Use `dpkg-query -W -f='${Status}' $pkg 2>/dev/null | grep -q 'ok installed'` for reliable idempotency checks in `apt`-based systems.

## 2025-05-15 - Batching file updates and avoiding process forks in Bash
**Learning:** Repetitive use of external utilities like `grep` to check file content in shell scripts introduces significant overhead due to process forking. Reading the file once into a Bash variable and using internal regex matching (`[[ $var =~ regex ]]`) is much faster.
**Action:** For configuration scripts that check for existing lines before appending, read the target file once and use Bash internal string/regex matching for all checks. Consolidate new lines and append them in a single operation.
