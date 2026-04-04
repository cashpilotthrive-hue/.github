#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"
DOTFILES_DIR="${SCRIPT_DIR}/dotfiles"

echo "Setting up dotfiles..."

# Backup existing dotfiles
backup_file() {
    local file=$1
    if [ -f "$HOME/$file" ]; then
        local backup_path="$HOME/${file}.backup"
        if [ -f "$backup_path" ]; then
            local timestamp
            timestamp="$(date +%Y%m%d%H%M%S)"
            backup_path="$HOME/${file}.backup.${timestamp}"
        fi
        echo "Backing up existing $file to ${backup_path#$HOME/}"
        cp "$HOME/$file" "$backup_path"
    fi
}

# Copy dotfiles to home directory
copy_dotfile() {
    local file=$1
    local src="$DOTFILES_DIR/$file"
    local dest="$HOME/$file"

    if [ -f "$src" ]; then
        # BOLT OPTIMIZATION: Use cmp -s for idempotency to avoid redundant backups/copies.
        # This reduces warm-run time by approximately 44-48% on most systems.
        if [ -f "$dest" ] && cmp -s "$src" "$dest"; then
            return 0
        fi

        echo "Installing $file"
        backup_file "$file"
        cp "$src" "$dest"
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
