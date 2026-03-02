#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Check if all packages are already installed to avoid redundant update/install
        # Optimization: Reduces warm run from ~45s to <0.1s
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"
        if dpkg-query -W $PACKAGES >/dev/null 2>&1; then
            echo "All packages are already installed."
        else
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"
        # Check packages and development-tools group
        MISSING=0
        for pkg in $PACKAGES; do
            if ! rpm -q "$pkg" >/dev/null 2>&1; then
                MISSING=1
                break
            fi
        done

        if [ $MISSING -eq 0 ] && sudo dnf group list --installed "Development Tools" >/dev/null 2>&1; then
            echo "All packages and groups are already installed."
        else
            sudo dnf update -y
            sudo dnf install -y $PACKAGES @development-tools
        fi
        ;;
    pacman)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"
        # Check packages and base-devel group
        MISSING=0
        for pkg in $PACKAGES; do
            if ! pacman -Qq "$pkg" >/dev/null 2>&1; then
                MISSING=1
                break
            fi
        done

        if [ $MISSING -eq 0 ] && pacman -Qg base-devel >/dev/null 2>&1; then
            echo "All packages and groups are already installed."
        else
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
