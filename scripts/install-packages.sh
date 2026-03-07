#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Check if packages are already installed to avoid unnecessary updates/installs
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"
        MISSING_PKGS=""
        for pkg in $PACKAGES; do
            if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
                MISSING_PKGS="$MISSING_PKGS $pkg"
            fi
        done

        if [ -n "$MISSING_PKGS" ]; then
            sudo apt-get update
            sudo apt-get install -y $MISSING_PKGS
        else
            echo "All essential packages are already installed."
        fi
        ;;
    dnf)
        # Check if packages or group are missing
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"
        MISSING_PKGS=""
        for pkg in $PACKAGES; do
            if ! rpm -q "$pkg" >/dev/null 2>&1; then
                MISSING_PKGS="$MISSING_PKGS $pkg"
            fi
        done

        # Check for development tools group
        if ! dnf group list --installed "Development Tools" | grep -q "Development Tools"; then
            MISSING_PKGS="$MISSING_PKGS @development-tools"
        fi

        if [ -n "$MISSING_PKGS" ]; then
            sudo dnf update -y
            sudo dnf install -y $MISSING_PKGS
        else
            echo "All essential packages are already installed."
        fi
        ;;
    pacman)
        # Check if packages or group are missing
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"
        MISSING_PKGS=""
        for pkg in $PACKAGES; do
            if ! pacman -Qq "$pkg" >/dev/null 2>&1; then
                MISSING_PKGS="$MISSING_PKGS $pkg"
            fi
        done

        # Check for base-devel group
        if ! pacman -Qg base-devel >/dev/null 2>&1; then
            MISSING_PKGS="$MISSING_PKGS base-devel"
        fi

        if [ -n "$MISSING_PKGS" ]; then
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm $MISSING_PKGS
        else
            echo "All essential packages are already installed."
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
