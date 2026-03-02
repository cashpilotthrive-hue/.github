# Personal Linux System Setup — Monorepo

This repository is organised as a production-ready monorepo containing all tooling, automation, and documentation for the Principal development environment.

## Structure

```
packages/
  setup/      # Personal Linux System Setup scripts and dotfiles
  realtime/   # Real-time data pipeline documentation and integration specs
docs/         # Shared documentation
.github/
  workflows/  # CI/CD and automation workflows
```

## Packages

### [`packages/setup`](packages/setup/README.md)
Automated Linux development-environment setup: package installation, dev-tool configuration, dotfiles, and system settings.

### [`packages/realtime`](packages/realtime/README.md)
Real-time data pipeline architecture: market data ingestion, bank/credit event processing, on-chain crypto events, and portfolio valuation.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/cashpilotthrive-hue/.github.git
cd .github

# Run the system setup
./packages/setup/setup.sh

# Or use the quick installer
bash packages/setup/install.sh
```

## Documentation

- [Usage Guide](docs/USAGE.md)
- [Workflow Preview](docs/WORKFLOW_PREVIEW.md)
- [Project Summary](docs/PROJECT_SUMMARY.md)

## Requirements

- Ubuntu 20.04+ / Debian 11+ / Fedora 35+ / Arch Linux
- sudo privileges
- Internet connection

## License

MIT License — feel free to use and modify for personal needs.
