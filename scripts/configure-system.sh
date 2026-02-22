#!/bin/bash
set -e

echo "Configuring system settings..."

# Set git to use main as default branch
git config --global init.defaultBranch main

# Enable colored output for common commands
git config --global color.ui auto

# Set vim as default editor
git config --global core.editor vim

# Configure git to cache credentials for 1 hour
git config --global credential.helper 'cache --timeout=3600'

# Create useful aliases
if ! grep -q "# Custom aliases" ~/.bashrc; then
    {
        echo ""
        echo "# Custom aliases"
        echo "alias ll='ls -alF'"
        echo "alias la='ls -A'"
        echo "alias l='ls -CF'"
        echo "alias ..='cd ..'"
        echo "alias ...='cd ../..'"
        echo "alias gs='git status'"
        echo "alias ga='git add'"
        echo "alias gc='git commit'"
        echo "alias gp='git push'"
        echo "alias gl='git log --oneline --graph --decorate'"
    } >> ~/.bashrc
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
