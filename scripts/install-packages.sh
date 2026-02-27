#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"
        # Optimization: Use dpkg-query to check if packages are already installed
        # This prevents redundant apt-get update/install runs on warm environments
        if dpkg-query -W $PACKAGES >/dev/null 2>&1; then
            echo "All packages are already installed. Skipping..."
        else
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"
        GROUPS="@development-tools"
        # Optimization: Check for installed packages and groups to avoid redundant dnf operations
        MISSING_PKGS=false
        for pkg in $PACKAGES; do
            if ! rpm -q $pkg >/dev/null 2>&1; then
                MISSING_PKGS=true
                break
            fi
        done

        if [ "$MISSING_PKGS" = false ] && dnf group list --installed "Development Tools" >/dev/null 2>&1; then
            echo "All packages and groups are already installed. Skipping..."
        else
            sudo dnf update -y
            sudo dnf install -y $PACKAGES $GROUPS
        fi
        ;;
    pacman)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"
        GROUPS="base-devel"
        # Optimization: Use pacman -Qq and -Qg to verify existing installations
        MISSING_PKGS=false
        for pkg in $PACKAGES; do
            if ! pacman -Qq $pkg >/dev/null 2>&1; then
                MISSING_PKGS=true
                break
            fi
        done

        if [ "$MISSING_PKGS" = false ] && pacman -Qg $GROUPS >/dev/null 2>&1; then
            echo "All packages and groups are already installed. Skipping..."
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
