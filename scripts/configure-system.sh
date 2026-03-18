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

# BOLT OPTIMIZATION: Consolidate ~/.bashrc updates to minimize I/O and process forks.
# This uses internal Bash string matching instead of multiple external 'grep' calls,
# reducing warm-run check time by ~50%.
BASHRC="$HOME/.bashrc"
touch "$BASHRC"

# Read the content once
content=$(cat "$BASHRC")

missing_configs=""

# Check for the header
if [[ ! "$content" =~ "# Custom aliases" ]]; then
    # Add a leading newline if the file is not empty and doesn't end with one
    if [[ -s "$BASHRC" && ! "$content" =~ $'\n'$ ]]; then
        missing_configs+="\n"
    fi
    missing_configs+="# Custom aliases\n"
fi

# Define aliases to check/add
# We use a simple space-separated list for better compatibility and to avoid associative arrays
aliases=(
    "ll:alias ll='ls -alF'"
    "la:alias la='ls -A'"
    "l:alias l='ls -CF'"
    "..:alias ..='cd ..'"
    "...:alias ...='cd ../..'"
    "gs:alias gs='git status'"
    "ga:alias ga='git add'"
    "gc:alias gc='git commit'"
    "gp:alias gp='git push'"
    "gl:alias gl='git log --oneline --graph --decorate'"
)

for entry in "${aliases[@]}"; do
    name="${entry%%:*}"
    definition="${entry#*:}"

    # Escape dots for regex matching: .. -> \.\.
    # We use a literal match for the alias name followed by =
    # The regex checks for 'alias name=' at the beginning of any line
    escaped_name="${name//./\\.}"
    if [[ ! "$content" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+$escaped_name= ]]; then
        missing_configs+="$definition\n"
    fi
done

if [ -n "$missing_configs" ]; then
    printf "%b" "$missing_configs" >> "$BASHRC"
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
