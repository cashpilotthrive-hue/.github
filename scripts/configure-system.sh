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
# Optimization: Read ~/.bashrc into memory once and use internal Bash matching
# to avoid multiple process forks for 'grep' and redundant disk I/O.
BASHRC_CONTENT=$(cat ~/.bashrc 2>/dev/null || echo "")
NEW_ALIASES=""

if [[ ! "$BASHRC_CONTENT" == *"# Custom aliases"* ]]; then
    NEW_ALIASES="${NEW_ALIASES}\n\n# Custom aliases"
fi

# Regex-like matching in Bash for better precision.
# Using (^|$'\n') to ensure the alias starts at the beginning of a line.
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+ll= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias ll='ls -alF'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+la= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias la='ls -A'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+l= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias l='ls -CF'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+\.\.= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias ..='cd ..'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+\.\.\.= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias ...='cd ../..'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+gs= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias gs='git status'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+ga= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias ga='git add'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+gc= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias gc='git commit'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+gp= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias gp='git push'"
[[ ! "$BASHRC_CONTENT" =~ (^|$'\n')[[:space:]]*alias[[:space:]]+gl= ]] && NEW_ALIASES="${NEW_ALIASES}\nalias gl='git log --oneline --graph --decorate'"

# Append all new aliases at once if any were missing
if [[ -n "$NEW_ALIASES" ]]; then
    printf "%b" "$NEW_ALIASES" >> ~/.bashrc
fi

# Set up SSH directory with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
[ -f ~/.ssh/config ] || touch ~/.ssh/config
chmod 600 ~/.ssh/config

echo "✓ System configuration complete"
