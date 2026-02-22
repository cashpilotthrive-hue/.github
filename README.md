# Linux Auto Setup

This repository includes an automated Linux bootstrap script:

- `scripts/setup-linux-auto.sh`

## Quick usage

```bash
sudo ./scripts/setup-linux-auto.sh
```

Override log file path if needed:

```bash
sudo LOG_FILE=/tmp/linux-setup.log ./scripts/setup-linux-auto.sh
```

---

## Script interpretation (`scripts/setup-linux-auto.sh`)

This section explains what each part of the script does.

### 1) Safety and shell behavior

- `#!/usr/bin/env bash`: uses Bash explicitly.
- `set -euo pipefail`:
  - `-e`: stop on command errors.
  - `-u`: treat unset variables as errors.
  - `-o pipefail`: fail pipelines if any command in them fails.

Why it matters: this makes setup automation safer and less likely to silently continue in a broken state.

### 2) Configuration values

- `LOG_FILE="${LOG_FILE:-/var/log/linux-auto-setup.log}"`
  - Uses `/var/log/linux-auto-setup.log` by default.
  - Lets callers override path with `LOG_FILE=...`.
- `PACKAGES=(...)`
  - Defines baseline tools and security packages to install.
  - Includes: `curl`, `wget`, `git`, `vim`, `htop`, `unzip`, `ca-certificates`, `gnupg`, `lsb-release`, `ufw`, `fail2ban`.

### 3) Logging helpers

- `info()` and `warn()` format status messages with tags.
- The script creates/touches the log file and redirects all stdout/stderr through `tee` so output is visible and persisted.

### 4) Root requirement

- Checks `EUID` and exits unless run as root.
- This is required because package installation, service control, and firewall changes need elevated privileges.

### 5) Package manager detection

Function: `detect_pm()`

Order of detection:
1. `apt-get` → returns `apt`
2. `dnf` → returns `dnf`
3. `pacman` → returns `pacman`
4. Otherwise → `unknown`

This allows one script to support Debian/Ubuntu, Fedora, and Arch-based systems.

### 6) Package installation flow

Function: `install_packages(pm)`

- For `apt`:
  - runs `apt-get update`
  - installs package list with non-interactive mode.
- For `dnf`:
  - installs package list with `dnf install -y`.
- For `pacman`:
  - refreshes DB and installs only missing packages via `--needed`.
- For unsupported PM:
  - logs warning and skips installation.

### 7) Systemd service handling

Function: `enable_service_if_exists(service)`

- Checks whether a service unit exists in `systemctl list-unit-files`.
- If present, enables and starts it.
- If missing, logs a warning and continues.

This avoids hard failures on distros where a unit might not exist.

### 8) Firewall setup

Function: `setup_firewall()`

- If `ufw` exists:
  - sets defaults: deny incoming, allow outgoing
  - allows OpenSSH
  - enables UFW (`--force` to avoid prompts)
- If `ufw` is missing:
  - logs warning and skips.

The `|| true` guards are used so non-critical firewall command issues won’t abort the entire provisioning run.

### 9) Fail2ban setup

Function: `setup_fail2ban()`

- If `fail2ban-client` exists:
  - enables/starts `fail2ban.service`.
- Otherwise logs warning and skips.

### 10) Main execution order

Function: `main()`

1. Log startup
2. Detect package manager
3. Install baseline packages
4. Configure firewall
5. Enable fail2ban
6. Log completion and log file path

Finally `main "$@"` executes the workflow.

---

## Expected result after successful run

- Common admin/network utilities are installed.
- Host firewall is active with conservative defaults and SSH allowed.
- Brute-force protection service (`fail2ban`) is enabled when available.
- Full execution log is stored at the configured `LOG_FILE` path.
