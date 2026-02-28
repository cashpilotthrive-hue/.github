#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"
        # Optimization: Check if packages are already installed to skip update/install
        if dpkg-query -W $PACKAGES >/dev/null 2>&1; then
            echo "✓ All essential packages are already installed"
        else
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"
        GROUP="development-tools"
        # Optimization: Check if packages and group are already installed
        MISSING=0
        for pkg in $PACKAGES; do
            if ! rpm -q "$pkg" >/dev/null 2>&1; then MISSING=1; break; fi
        done
        if [ "$MISSING" -eq 0 ] && sudo dnf group list --installed "$GROUP" >/dev/null 2>&1; then
            echo "✓ All essential packages are already installed"
        else
            sudo dnf update -y
            sudo dnf install -y $PACKAGES
            sudo dnf groupinstall -y "$GROUP"
        fi
        ;;
    pacman)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"
        GROUP="base-devel"
        # Optimization: Check if packages and group are already installed
        MISSING=0
        for pkg in $PACKAGES; do
            if ! pacman -Qq "$pkg" >/dev/null 2>&1; then MISSING=1; break; fi
        done
        if [ "$MISSING" -eq 0 ] && pacman -Qg "$GROUP" >/dev/null 2>&1; then
            echo "✓ All essential packages are already installed"
        else
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm $PACKAGES $GROUP
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installation process complete"
