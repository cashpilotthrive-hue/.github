#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Define package list
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"

        # Optimization: Check if all packages are already installed to skip slow update and install steps.
        # dpkg-query -W returns non-zero if any package is missing.
        if dpkg-query -W $PACKAGES >/dev/null 2>&1; then
            echo "✓ All packages already installed (skipped apt-get update)"
        else
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        # Define package list
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"

        # Optimization: Check if individual packages and development tools group are already installed.
        # rpm -q returns non-zero if any package is missing.
        if rpm -q $PACKAGES >/dev/null 2>&1 && dnf group list --installed "Development Tools" >/dev/null 2>&1; then
            echo "✓ All packages and groups already installed (skipped dnf update)"
        else
            sudo dnf update -y
            sudo dnf install -y $PACKAGES @development-tools
        fi
        ;;
    pacman)
        # Define package list
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"

        # Optimization: Check if individual packages and base-devel group are already installed.
        # pacman -Q returns non-zero if any package is missing.
        if pacman -Q $PACKAGES >/dev/null 2>&1 && pacman -Qg base-devel >/dev/null 2>&1; then
            echo "✓ All packages and groups already installed (skipped pacman -Syu)"
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
