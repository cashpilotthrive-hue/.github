# Copilot Instructions

This repository contains scripts and configurations for setting up a personal Linux development environment. It supports multiple Linux distributions (Ubuntu/Debian, Fedora/RHEL, Arch Linux).

## Repository Structure

- `setup.sh` — Main orchestration script that detects the package manager and runs all setup steps
- `install.sh` — Quick one-line installer for remote bootstrap
- `scripts/` — Individual setup scripts (`install-packages.sh`, `install-devtools.sh`, `setup-dotfiles.sh`, `configure-system.sh`)
- `dotfiles/` — User configuration files (`.bashrc`, `.gitconfig`, `.vimrc`, `.tmux.conf`)
- `config/packages.txt` — List of packages to install

## Coding Conventions

- All shell scripts must start with `#!/bin/bash` and use `set -e` to exit on errors.
- Use `case` statements for package-manager-specific logic, supporting `apt`, `dnf`, and `pacman`.
- Use color variables (`RED`, `GREEN`, `YELLOW`, `NC`) for user-facing output, as established in `setup.sh`.
- Validate scripts with `bash -n` for syntax correctness before committing.
- Keep scripts modular: each script in `scripts/` handles a single responsibility.

## Testing

- CI runs on GitHub Actions (`.github/workflows/test-setup.yml`).
- Tests validate shell script syntax (`bash -n`), repository structure, and dotfile existence.
- Full installation is not run in CI because it requires `sudo`.

## Adding New Packages or Tools

- Add new packages to `config/packages.txt`.
- For tools that require custom installation steps, add logic to the appropriate script in `scripts/` using the `case "$PKG_MANAGER"` pattern to handle each supported distribution.

## Security

- Never hardcode secrets or credentials in scripts.
- Workflow permissions are restricted to `contents: read`.
- Follow the security policy in `SECURITY.md` for reporting vulnerabilities.
