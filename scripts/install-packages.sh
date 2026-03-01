#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Optimization: Check if all packages are already installed to skip update/install
        # This significantly speeds up the setup process when packages are already present.
        # Note: We use dpkg-query to detect missing packages efficiently.
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"
        if dpkg-query -W $PACKAGES >/dev/null 2>&1; then
            echo "All essential packages are already installed. Skipping..."
        else
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        # Optimization: Check if all packages and groups are already installed
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"
        GROUPS="development-tools"
        MISSING=0
        for pkg in $PACKAGES; do
            if ! rpm -q $pkg >/dev/null 2>&1; then MISSING=1; break; fi
        done
        if [ $MISSING -eq 0 ]; then
            for grp in $GROUPS; do
                # Check if group is installed by checking dnf group list output
                if ! dnf group list --installed "$grp" | grep -iq "$grp"; then MISSING=1; break; fi
            done
        fi

        if [ $MISSING -eq 0 ]; then
            echo "All essential packages and groups are already installed. Skipping..."
        else
            sudo dnf update -y
            sudo dnf install -y $PACKAGES @$GROUPS
        fi
        ;;
    pacman)
        # Optimization: Check if all packages and groups are already installed
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"
        GROUPS="base-devel"
        MISSING=0
        for pkg in $PACKAGES; do
            if ! pacman -Qq $pkg >/dev/null 2>&1; then MISSING=1; break; fi
        done
        if [ $MISSING -eq 0 ]; then
            for grp in $GROUPS; do
                # Check if all members of the group are installed
                if ! pacman -Qg "$grp" >/dev/null 2>&1; then MISSING=1; break; fi
            done
        fi

        if [ $MISSING -eq 0 ]; then
            echo "All essential packages and groups are already installed. Skipping..."
        else
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm $PACKAGES $GROUPS
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
