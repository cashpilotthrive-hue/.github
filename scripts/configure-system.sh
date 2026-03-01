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
    echo "" >> ~/.bashrc
    echo "# Custom aliases" >> ~/.bashrc
fi

if ! grep -qE '^[[:space:]]*alias[[:space:]]+ll=' ~/.bashrc; then
    echo "alias ll='ls -alF'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+la=' ~/.bashrc; then
    echo "alias la='ls -A'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+l=' ~/.bashrc; then
    echo "alias l='ls -CF'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+\.\.=' ~/.bashrc; then
    echo "alias ..='cd ..'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+\.\.\.=' ~/.bashrc; then
    echo "alias ...='cd ../..'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+gs=' ~/.bashrc; then
    echo "alias gs='git status'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+ga=' ~/.bashrc; then
    echo "alias ga='git add'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+gc=' ~/.bashrc; then
    echo "alias gc='git commit'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+gp=' ~/.bashrc; then
    echo "alias gp='git push'" >> ~/.bashrc
fi
if ! grep -qE '^[[:space:]]*alias[[:space:]]+gl=' ~/.bashrc; then
    echo "alias gl='git log --oneline --graph --decorate'" >> ~/.bashrc
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
