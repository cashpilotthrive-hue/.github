# Copilot Instructions for cashpilotthrive-hue/.github

## Repository Overview

This repository serves two purposes:
1. **Organization-wide GitHub defaults** – issue/PR templates, workflows, and community health files that apply across the `cashpilotthrive-hue` organization.
2. **Personal Linux system setup** – shell scripts, dotfiles, and configuration for automating a Linux development environment.

## Stack & Technologies

- **Shell scripting**: Bash (all scripts use `#!/bin/bash` with `set -e`)
- **CI/CD**: GitHub Actions (`.github/workflows/`)
- **Package managers supported**: `apt` (Ubuntu/Debian), `dnf` (Fedora/RHEL), `pacman` (Arch)
- **Revenue tooling**: Stripe, Paddle, Gumroad, Shopify, HubSpot, PostHog integrations via GitHub secrets/variables

## Code Conventions

- All shell scripts must begin with `#!/bin/bash` and `set -e`
- Use color-coded output: `RED`, `GREEN`, `YELLOW` with `NC` reset (already defined in `setup.sh`)
- Detect the package manager at runtime — never hard-code `apt`, `dnf`, or `pacman`
- Scripts must be idempotent where possible (safe to run multiple times)
- Keep secrets out of code; use GitHub Actions secrets (`${{ secrets.NAME }}`) and variables (`${{ vars.NAME }}`)
- Workflow files must include `permissions: contents: read` (least-privilege by default)

## Directory Structure

```
.github/
  workflows/          # GitHub Actions workflows
  ISSUE_TEMPLATE/     # Issue templates
  copilot-instructions.md
  pull_request_template.md
scripts/              # Modular shell scripts (install, configure)
dotfiles/             # User dotfiles (.bashrc, .gitconfig, .vimrc, .tmux.conf)
config/               # Static configuration (packages.txt)
setup.sh              # Main orchestration script
install.sh            # One-line remote installer
```

## Testing & CI

- Workflow `test-setup.yml` validates script syntax (`bash -n`) and file structure on every push/PR
- Do not remove or weaken existing CI checks
- New shell scripts should be added to the syntax-check loop in `test-setup.yml`

## What to Avoid

- Do not hardcode credentials, API keys, or tokens anywhere in the codebase
- Do not run `apt-get install` without first calling `apt-get update`
- Do not add `sudo` inside scripts that are already expected to run as root
- Do not modify `CODEOWNERS` without team review
