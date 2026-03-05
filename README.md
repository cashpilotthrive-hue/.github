# Personal Linux System Setup

This repository contains scripts and configurations for setting up a personal Linux development environment.

## Features

- 🚀 Automated package installation
- 🛠️ Development tools configuration
- ⚙️ System dotfiles (bash, git, vim)
- 🔒 Security hardening
- 📦 Package manager support (apt, dnf, pacman)

## Quick Start

```bash
# Clone this repository
git clone https://github.com/cashpilotthrive-hue/.github.git
cd .github

# Run the main setup script
chmod +x setup.sh
./setup.sh
```

## What Gets Installed

### Essential Packages
- curl, wget, git
- build-essential / Development Tools
- vim/neovim, tmux
- htop, tree, ncdu

### Development Tools
- Node.js & npm
- Python 3 & pip
- Docker & Docker Compose
- GitHub CLI (gh)

### Optional Tools
- Terraform
- kubectl

## Customization

Edit `config/packages.txt` to add or remove packages.
Modify dotfiles in the `dotfiles/` directory to customize your environment.

## Structure

```
.
├── setup.sh              # Main setup script
├── scripts/              # Individual setup scripts
│   ├── install-packages.sh
│   ├── install-devtools.sh
│   ├── setup-dotfiles.sh
│   └── configure-system.sh
├── dotfiles/             # Configuration files
│   ├── .bashrc
│   ├── .gitconfig
│   └── .vimrc
└── config/               # Configuration data
    └── packages.txt
```

## Requirements

- Ubuntu 20.04+ / Debian 11+ / Fedora 35+ / Arch Linux
- sudo privileges
- Internet connection

## License

MIT License - Feel free to use and modify for your personal needs.
