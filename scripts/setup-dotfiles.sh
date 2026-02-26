#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
DOTFILES_DIR="${SCRIPT_DIR}/dotfiles"

echo "Setting up dotfiles..."

# Backup existing dotfiles
backup_file() {
    local file=$1
    if [ -f "$HOME/$file" ]; then
        echo "Backing up existing $file to ${file}.backup"
        cp "$HOME/$file" "$HOME/${file}.backup"
    fi
}

# Copy dotfiles to home directory
copy_dotfile() {
    local file=$1
    if [ -f "$DOTFILES_DIR/$file" ]; then
        echo "Installing $file"
        backup_file "$file"
        cp "$DOTFILES_DIR/$file" "$HOME/$file"
    fi
}

# Setup bash configuration
copy_dotfile ".bashrc"

# Setup git configuration
copy_dotfile ".gitconfig"

# Setup vim configuration
copy_dotfile ".vimrc"

# Setup tmux configuration
copy_dotfile ".tmux.conf"

# Create necessary directories
mkdir -p "$HOME/.config"
mkdir -p "$HOME/bin"
mkdir -p "$HOME/projects"

echo "✓ Dotfiles setup complete"
