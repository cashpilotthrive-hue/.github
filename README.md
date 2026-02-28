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
- GitHub CLI (gh)
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

## Additional Guides

### Kali Linux VirtualBox VM Setup

Looking to set up a fully customized Kali Linux VM for penetration testing and security research? Check out our comprehensive guide:

📖 **[Kali Linux VirtualBox VM Setup Guide](KALI_VM_SETUP.md)**

This guide covers:
- Complete VirtualBox VM configuration
- Kali Linux installation and setup
- Tool installation (metapackages, Docker, Python, etc.)
- Desktop environment customization
- Network configuration
- Security hardening and optimization
- Persistent snapshots and backup strategies

Perfect for security professionals, ethical hackers, and anyone interested in learning cybersecurity tools.

## License

MIT License - Feel free to use and modify for your personal needs.
