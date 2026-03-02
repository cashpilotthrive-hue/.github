#!/bin/bash
set -e

echo "Configuring system settings..."

# Set git to use main as default branch
git config --global init.defaultBranch main

# Enable colored output for common commands
git config --global color.ui auto

# Set vim as default editor
git config --global core.editor vim

# Configure line ending and global gitignore
git config --global core.autocrlf input
git config --global core.excludesfile ~/.gitignore_global

# Configure git to cache credentials for 1 hour
git config --global credential.helper 'cache --timeout=3600'

# Configure pull, push, fetch, and log behavior
git config --global pull.rebase false
git config --global push.default simple
git config --global fetch.prune true
git config --global log.date relative

# Configure diff and merge tools
git config --global diff.tool vimdiff
git config --global merge.tool vimdiff
git config --global merge.conflictstyle diff3

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
fi

add_alias_if_missing() {
    local name=$1
    local definition=$2
    if ! grep -qE "^[[:space:]]*alias[[:space:]]+${name}=" ~/.bashrc; then
        echo "alias ${name}='${definition}'" >> ~/.bashrc
    fi
}

add_alias_if_missing ll 'ls -alF'
add_alias_if_missing la 'ls -A'
add_alias_if_missing l 'ls -CF'
add_alias_if_missing '..' 'cd ..'
add_alias_if_missing '...' 'cd ../..'
add_alias_if_missing gs 'git status'
add_alias_if_missing ga 'git add'
add_alias_if_missing gc 'git commit'
add_alias_if_missing gp 'git push'
add_alias_if_missing gl 'git log --oneline --graph --decorate'

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
