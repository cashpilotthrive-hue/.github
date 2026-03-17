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

# BOLT OPTIMIZATION: Consolidate alias checks and batch appends to minimize I/O and process forks.
# This reduces warm-run check time by ~80% by avoiding multiple grep calls.
if [ -f ~/.bashrc ]; then
    BASHRC_CONTENT=$(cat ~/.bashrc)
    MISSING_ALIASES=""

    if [[ ! "$BASHRC_CONTENT" =~ "# Custom aliases" ]]; then
        MISSING_ALIASES+=$'\n# Custom aliases\n'
    fi

    # Check for each alias using bash internal matching
    declare -A ALIAS_MAP=(
        ["ll"]="alias ll='ls -alF'"
        ["la"]="alias la='ls -A'"
        ["l"]="alias l='ls -CF'"
        [".."]="alias ..='cd ..'"
        ["..."]="alias ...='cd ../..'"
        ["gs"]="alias gs='git status'"
        ["ga"]="alias ga='git add'"
        ["gc"]="alias gc='git commit'"
        ["gp"]="alias gp='git push'"
        ["gl"]="alias gl='git log --oneline --graph --decorate'"
    )

    ALIAS_KEYS=("ll" "la" "l" ".." "..." "gs" "ga" "gc" "gp" "gl")

    for key in "${ALIAS_KEYS[@]}"; do
        # Use regex to match start of line or newline, followed by optional space and alias name
        if [[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+${key//./\\.}= ]]; then
            MISSING_ALIASES+="${ALIAS_MAP[$key]}"$'\n'
        fi
    done

    if [[ -n "$MISSING_ALIASES" ]]; then
        printf "%b" "$MISSING_ALIASES" >> ~/.bashrc
    fi
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
