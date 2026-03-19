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
# BOLT OPTIMIZATION: Read .bashrc once and use internal Bash regex to batch updates.
# This avoids multiple external process forks (grep) in a loop, significantly
# reducing execution time for warm runs.
BASHRC=~/.bashrc
touch "$BASHRC"
BASHRC_CONTENT=$(<"$BASHRC")

# Array of alias definitions to add (key and value)
ALIASES=(
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

MISSING_ALIASES=""
for entry in "${ALIASES[@]}"; do
    key="${entry%%:*}"
    value="${entry#*:}"

    # Escape dots in keys for regex matching
    regex_key="${key//./\\.}"
    # Match at the start of any line, optionally preceded by whitespace
    if [[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+$regex_key= ]]; then
        MISSING_ALIASES+="$value"$'\n'
    fi
done

if [[ -n "$MISSING_ALIASES" ]]; then
    # Add a header if it doesn't exist
    if [[ ! "$BASHRC_CONTENT" =~ (^|$'\n')'# Custom aliases' ]]; then
        printf "\n# Custom aliases\n" >> "$BASHRC"
    fi
    printf "%s" "$MISSING_ALIASES" >> "$BASHRC"
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
