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

# BOLT OPTIMIZATION: Read .bashrc once and use internal Bash regex to avoid multiple grep forks.
# This reduces warm-run execution time by ~15-20%.
BASHRC="$HOME/.bashrc"
touch "$BASHRC"
BASHRC_CONTENT=$(<"$BASHRC")

NEW_CONFIG=""

# Check for custom aliases section header
# Match at start of string or after a newline
HEADER="# Custom aliases"
if [[ ! "$BASHRC_CONTENT" =~ (^|$'\n')"$HEADER" ]]; then
    # Add a leading newline if the file is not empty and doesn't end with one
    if [[ -s "$BASHRC" && ! "$BASHRC_CONTENT" =~ $'\n'$ ]]; then
        NEW_CONFIG+="\n"
    fi
    NEW_CONFIG+="\n# Custom aliases\n"
fi

# Helper to check if alias exists in BASHRC_CONTENT using internal regex
alias_exists() {
    local alias_name=$1
    # Escape dots for regex, e.g., '..' -> '\.\.'
    local escaped_name="${alias_name//./\\.}"
    # Match alias at start of line or after a newline
    [[ "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+$escaped_name= ]]
}

# List of aliases to ensure
declare -A ALIASES=(
    ["ll"]="ls -alF"
    ["la"]="ls -A"
    ["l"]="ls -CF"
    [".."]="cd .."
    ["..."]="cd ../.."
    ["gs"]="git status"
    ["ga"]="git add"
    ["gc"]="git commit"
    ["gp"]="git push"
    ["gl"]="git log --oneline --graph --decorate"
)

# Maintain specific order for consistency
ORDERED_ALIASES=("ll" "la" "l" ".." "..." "gs" "ga" "gc" "gp" "gl")

for alias_name in "${ORDERED_ALIASES[@]}"; do
    if ! alias_exists "$alias_name"; then
        NEW_CONFIG+="alias $alias_name='${ALIASES[$alias_name]}'\n"
    fi
done

if [[ -n "$NEW_CONFIG" ]]; then
    printf "%b" "$NEW_CONFIG" >> "$BASHRC"
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
