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

# Configure pull, push, fetch, and log behavior
git config --global pull.rebase false
git config --global push.default simple
git config --global fetch.prune true
git config --global log.date relative

# Configure git aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --decorate --all'
git config --global alias.amend 'commit --amend'
git config --global alias.undo 'reset --soft HEAD^'

# Create useful aliases
if ! grep -q "# Custom aliases" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Custom aliases" >> ~/.bashrc
    echo "alias ll='ls -alF'" >> ~/.bashrc
    echo "alias la='ls -A'" >> ~/.bashrc
    echo "alias l='ls -CF'" >> ~/.bashrc
    echo "alias ..='cd ..'" >> ~/.bashrc
    echo "alias ...='cd ../..'" >> ~/.bashrc
    echo "alias gs='git status'" >> ~/.bashrc
    echo "alias ga='git add'" >> ~/.bashrc
    echo "alias gc='git commit'" >> ~/.bashrc
    echo "alias gp='git push'" >> ~/.bashrc
    echo "alias gl='git log --oneline --graph --decorate'" >> ~/.bashrc
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
