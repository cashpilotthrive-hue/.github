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

# BOLT OPTIMIZATION: Read .bashrc once and use internal string matching
# to avoid multiple process forks from grep.
BASHRC="$HOME/.bashrc"
touch "$BASHRC"
BASHRC_CONTENT=$(cat "$BASHRC")
NEW_ALIASES=""
NEWLINE=$'\n'

add_alias_if_missing() {
    local alias_name="$1"
    local alias_cmd="$2"
    # Use Bash internal regex matching for speed.
    # regex matches: (start of string OR newline), optional whitespace, 'alias',
    # mandatory whitespace, alias name, then '=' or whitespace.
    local regex="(^|${NEWLINE})[[:space:]]*alias[[:space:]]+${alias_name//./\\.}[=[:space:]]"
    if [[ ! "$BASHRC_CONTENT" =~ $regex ]]; then
        NEW_ALIASES="${NEW_ALIASES}alias ${alias_name}='${alias_cmd}'${NEWLINE}"
    fi
}

# Check for custom aliases header
if [[ ! "$BASHRC_CONTENT" =~ "# Custom aliases" ]]; then
    NEW_ALIASES="# Custom aliases${NEWLINE}${NEW_ALIASES}"
fi

# Define aliases to check
add_alias_if_missing "ll" "ls -alF"
add_alias_if_missing "la" "ls -A"
add_alias_if_missing "l" "ls -CF"
add_alias_if_missing ".." "cd .."
add_alias_if_missing "..." "cd ../.."
add_alias_if_missing "gs" "git status"
add_alias_if_missing "ga" "git add"
add_alias_if_missing "gc" "git commit"
add_alias_if_missing "gp" "git push"
add_alias_if_missing "gl" "git log --oneline --graph --decorate"

# Append all missing aliases in a single write operation if any exist
if [[ -n "$NEW_ALIASES" ]]; then
    printf "\n%b" "$NEW_ALIASES" >> "$BASHRC"
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
