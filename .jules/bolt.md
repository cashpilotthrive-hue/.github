## 2025-05-14 - Idempotent package installation on Ubuntu Noble
**Learning:** On Ubuntu 24.04 (Noble), \`dpkg-query -W\` may return exit code 0 even if a package is not fully installed (e.g., it was removed but config files remain). To safely skip installation, one must check the status string for 'ok installed'.
**Action:** Use \`dpkg-query -W -f='${Status}' "\$pkg" 2>/dev/null | grep -q 'ok installed'\` for reliable package existence checks in shell scripts.
