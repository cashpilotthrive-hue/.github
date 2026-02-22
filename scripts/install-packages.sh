#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # List of packages to install
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"

        # Check which packages are already installed to avoid unnecessary apt-get update/install
        # This provides a significant speedup in warm environments (from ~6s to <0.1s)
        PKG_COUNT=$(echo $PACKAGES | wc -w)
        INSTALLED_COUNT=$(dpkg-query -W -f='${Status}\n' $PACKAGES 2>/dev/null | grep -c "install ok installed" || true)

        if [ "$INSTALLED_COUNT" -eq "$PKG_COUNT" ]; then
            echo "✓ All essential packages are already installed."
        else
            echo "Installing missing packages..."
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        # List of packages to install (excluding groups)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"

        # Check if packages are already installed
        if rpm -q $PACKAGES >/dev/null 2>&1; then
            echo "✓ Essential packages are already installed."
        else
            echo "Installing missing packages..."
            sudo dnf update -y
            sudo dnf install -y $PACKAGES @development-tools
        fi
        ;;
    pacman)
        # List of packages to install (excluding groups)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"

        # Check if packages are already installed
        if pacman -Qq $PACKAGES >/dev/null 2>&1; then
            echo "✓ Essential packages are already installed."
        else
            echo "Installing missing packages..."
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
