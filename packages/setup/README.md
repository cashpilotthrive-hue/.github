# packages/setup — Personal Linux System Setup

Automated scripts for setting up a personal Linux development environment across multiple distributions.

## Features

- 🚀 Automated package installation
- 🛠️ Development tools configuration (Node.js, Python, Docker, GitHub CLI)
- ⚙️ System dotfiles (bash, git, vim, tmux)
- 📦 Package manager support: `apt`, `dnf`, `pacman`

## Structure

```
packages/setup/
├── setup.sh              # Main orchestration script
├── install.sh            # Quick one-line installer
├── scripts/
│   ├── install-packages.sh
│   ├── install-devtools.sh
│   ├── setup-dotfiles.sh
│   └── configure-system.sh
├── dotfiles/
│   ├── .bashrc
│   ├── .gitconfig
│   ├── .vimrc
│   └── .tmux.conf
└── config/
    └── packages.txt
```

## Usage

```bash
# From the repository root
./packages/setup/setup.sh

# Or via quick installer
bash packages/setup/install.sh
```

### Individual scripts

```bash
./packages/setup/scripts/install-packages.sh apt
./packages/setup/scripts/install-devtools.sh apt
./packages/setup/scripts/setup-dotfiles.sh
./packages/setup/scripts/configure-system.sh
```

## Customization

- Edit `config/packages.txt` to add or remove packages.
- Edit dotfiles in `dotfiles/` before running setup, or update them in `~` afterwards.

## Requirements

- Ubuntu 20.04+ / Debian 11+ / Fedora 35+ / Arch Linux
- `sudo` privileges and internet access
