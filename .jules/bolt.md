## 2025-05-15 - Idempotent Package Installation
**Learning:** Running package manager update and install commands unconditionally on every setup run introduces significant latency (~5-30+ seconds depending on the environment). Implementing a simple presence check using `dpkg-query`, `rpm`, or `pacman` allows skipping these operations if requirements are already met.
**Action:** Use idempotency checks for all setup and installation scripts to ensure "warm" runs are near-instant.

## 2025-05-15 - Agent Tool Truncation Handling
**Learning:** Agent tool outputs (like \`read_file\` or \`run_in_bash_session\`) are truncated at 1000 characters. For large scripts, this can lead to missed logic or package lists if not handled carefully.
**Action:** Use \`sed\` or similar tools to read large files in non-overlapping chunks to ensure full visibility before planning modifications.
