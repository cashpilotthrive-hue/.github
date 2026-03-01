#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"
        # Optimization: Check if all packages are already installed to skip update and redundant install
        if ! dpkg-query -W $PACKAGES >/dev/null 2>&1; then
            echo "Installing missing packages via apt..."
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        else
            echo "✓ All packages already installed (skipping apt update/install)"
        fi
        ;;
    dnf)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"
        GROUPS="@development-tools"
        MISSING_PKGS=0
        # Optimization: Check individual packages
        for pkg in $PACKAGES; do
            if ! rpm -q "$pkg" >/dev/null 2>&1; then MISSING_PKGS=1; break; fi
        done
        # Check groups if packages are all there
        if [ $MISSING_PKGS -eq 0 ]; then
            if ! dnf group list --installed "$GROUPS" >/dev/null 2>&1; then MISSING_PKGS=1; fi
        fi

        if [ $MISSING_PKGS -eq 1 ]; then
            echo "Installing missing packages via dnf..."
            sudo dnf update -y
            sudo dnf install -y $PACKAGES $GROUPS
        else
            echo "✓ All packages already installed (skipping dnf update/install)"
        fi
        ;;
    pacman)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"
        GROUPS="base-devel"
        MISSING_PKGS=0
        # Optimization: Check individual packages
        for pkg in $PACKAGES; do
            if ! pacman -Qq "$pkg" >/dev/null 2>&1; then MISSING_PKGS=1; break; fi
        done
        # Check groups if packages are all there
        if [ $MISSING_PKGS -eq 0 ]; then
            for group in $GROUPS; do
                if ! pacman -Qg "$group" >/dev/null 2>&1; then MISSING_PKGS=1; break; fi
            done
        fi

        if [ $MISSING_PKGS -eq 1 ]; then
            echo "Installing missing packages via pacman..."
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm $PACKAGES $GROUPS
        else
            echo "✓ All packages already installed (skipping pacman update/install)"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
