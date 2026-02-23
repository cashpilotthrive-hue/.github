#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"
        # Bolt Optimization: Skip update and install if all packages are already present
        if ! dpkg-query -W $PACKAGES >/dev/null 2>&1; then
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"
        # Bolt Optimization: Check for individual packages and the @development-tools group
        NEEDS_INSTALL=0
        if ! rpm -q $PACKAGES >/dev/null 2>&1; then
            NEEDS_INSTALL=1
        elif ! dnf group list --installed "Development Tools" >/dev/null 2>&1; then
            NEEDS_INSTALL=1
        fi

        if [ $NEEDS_INSTALL -eq 1 ]; then
            sudo dnf update -y
            sudo dnf install -y $PACKAGES @development-tools
        fi
        ;;
    pacman)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"
        # Bolt Optimization: Check for individual packages and the base-devel group
        NEEDS_INSTALL=0
        if ! pacman -Qq $PACKAGES >/dev/null 2>&1; then
            NEEDS_INSTALL=1
        elif ! pacman -Qg base-devel >/dev/null 2>&1; then
            NEEDS_INSTALL=1
        fi

        if [ $NEEDS_INSTALL -eq 1 ]; then
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm $PACKAGES base-devel
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
