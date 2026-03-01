# Copilot Instructions

## Project Overview

This repository contains scripts and configurations for setting up a personal Linux development environment. It supports multiple Linux distributions (Ubuntu/Debian, Fedora/RHEL, Arch Linux) and automates the installation of essential packages, development tools, and dotfiles.

## Repository Structure

```
.
├── setup.sh                     # Main orchestration script (entry point)
├── install.sh                   # Quick one-line installer
├── scripts/
│   ├── install-packages.sh      # Essential system packages
│   ├── install-devtools.sh      # Developer tools (Node.js, Python, Docker, etc.)
│   ├── setup-dotfiles.sh        # Deploys dotfiles to home directory
│   └── configure-system.sh      # System-level configuration and hardening
├── dotfiles/
│   ├── .bashrc                  # Bash shell configuration
│   ├── .gitconfig               # Git configuration template
│   ├── .vimrc                   # Vim editor settings
│   └── .tmux.conf               # Tmux multiplexer configuration
├── config/
│   └── packages.txt             # List of packages to install
└── .github/
    └── workflows/
        └── test-setup.yml       # GitHub Actions CI workflow
```

## Coding Conventions

- All scripts use `bash` (shebang: `#!/usr/bin/env bash`)
- Scripts use `set -e` (fail on error) and `set -u` (fail on unset variables) where appropriate
- Package manager detection is done via `command -v` checks (apt, dnf, pacman)
- User-facing messages use `echo` with emoji prefixes (e.g., `echo "✓ Done"`, `echo "→ Installing..."`)
- Error messages go to stderr: `echo "Error: ..." >&2`
- Functions are used to encapsulate repeated logic within scripts

## How to Validate Changes

- **Syntax check** all shell scripts: `bash -n <script>.sh`
- **Structure validation**: Ensure required directories (`scripts/`, `dotfiles/`, `config/`) and files (`setup.sh`, `README.md`) exist
- **Dotfiles check**: Confirm `dotfiles/.bashrc`, `dotfiles/.gitconfig`, `dotfiles/.vimrc`, `dotfiles/.tmux.conf` are present
- The CI workflow (`.github/workflows/test-setup.yml`) runs these checks automatically on push/PR

## Cross-Distribution Compatibility

When modifying installation scripts, always handle all three package managers:
- `apt` for Ubuntu/Debian
- `dnf` for Fedora/RHEL/CentOS
- `pacman` for Arch Linux

## Security Guidelines

- Do not hardcode credentials, tokens, or secrets in any file
- Do not commit files containing internal network information (IP addresses, topology maps, scan results)
- Scripts requiring `sudo` should only escalate for specific commands, not run the whole script as root
- GitHub Actions workflows must have `permissions: contents: read` (principle of least privilege)

## Testing

There is no automated unit test framework. Validation is done via:
1. Bash syntax checking (`bash -n`)
2. File existence assertions (`test -f`, `test -d`)
3. The GitHub Actions workflow in `.github/workflows/test-setup.yml`

Full integration testing requires an actual Linux system with `sudo` privileges and is not run in CI.
