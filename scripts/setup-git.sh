#!/bin/bash
set -e

# Standalone Git auto-configuration script
# Usage: ./scripts/setup-git.sh
# Runs hands-off: no interactive prompts required

echo "Configuring Git settings autonomously..."

# Set main as default branch for new repositories
git config --global init.defaultBranch main

# Set vim as default editor
git config --global core.editor vim

# Enable colored output
git config --global color.ui auto

# Cache credentials for 1 hour
git config --global credential.helper 'cache --timeout=3600'

# Sensible pull and push defaults
git config --global pull.rebase false
git config --global push.default simple

# Prune stale remote-tracking branches on fetch
git config --global fetch.prune true

# Use relative dates in log
git config --global log.date relative

# Diff and merge tool
git config --global diff.tool vimdiff
git config --global merge.tool vimdiff
git config --global merge.conflictstyle diff3

# Git aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --decorate --all'
git config --global alias.amend 'commit --amend'
git config --global alias.undo 'reset --soft HEAD^'

echo "✓ Git configuration complete"
echo ""
echo "Applied settings:"
git config --global --list | grep -E '(init\.|core\.editor|color\.|credential\.|pull\.|push\.|fetch\.|log\.|diff\.|merge\.|alias\.)' | sort
