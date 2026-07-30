# 🐧 Get the Linux Setup

The fastest way to get your personal Linux development environment set up.

## Quick Install (One Command)

> **⚠️ Security Note**: Review the [install.sh](https://github.com/cashpilotthrive-hue/.github/blob/main/install.sh) script before running to understand what it does. For maximum security, use the manual installation method below.

```bash
curl -fsSL https://raw.githubusercontent.com/cashpilotthrive-hue/.github/main/install.sh | bash && cd ~/.personal-linux-setup && ./setup.sh
```

That's it! This single command will:
- ✅ Download the entire setup
- ✅ Install essential packages
- ✅ Set up development tools (Node.js, Python, Docker, Git)
- ✅ Configure dotfiles (.bashrc, .gitconfig, .vimrc, .tmux.conf)
- ✅ Apply system configurations

## Manual Install (More Control)

If you prefer to review before installing (recommended):

```bash
# 1. Download
git clone https://github.com/cashpilotthrive-hue/.github.git
cd .github

# 2. Review what will be installed
cat README.md
cat USAGE.md
ls scripts/
ls dotfiles/

# 3. Run setup when ready
./setup.sh
```

> **Note**: The quick install clones to `~/.personal-linux-setup` as defined in install.sh. Manual installation allows you to choose any directory.

## What You Get

After installation, you'll have:

- **Essential Tools**: curl, wget, git, vim, tmux, htop, tree
- **Development Environment**: Node.js (LTS), Python 3, Docker, GitHub CLI
- **Enhanced Shell**: Customized bash with useful aliases and functions
- **Version Control**: Pre-configured Git with shortcuts
- **Editor**: Vim with modern configuration
- **Terminal Multiplexer**: Tmux with intuitive key bindings

## Supported Systems

- Ubuntu 20.04+
- Debian 11+
- Fedora 35+
- Arch Linux

## After Installation

```bash
# Reload your shell configuration
source ~/.bashrc

# Verify installations
node --version
python3 --version
docker --version
gh --version
```

## Need Help?

- **Quick Start**: See [README.md](README.md)
- **Detailed Guide**: See [USAGE.md](USAGE.md)
- **Customization**: Edit files in `config/` and `dotfiles/` before running setup

## License

MIT License - Free to use and modify
