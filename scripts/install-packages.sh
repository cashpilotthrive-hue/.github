#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++"

        # Check if all packages are already installed to avoid redundant update/install
        # We count the number of packages that are in 'install ok installed' status
        INSTALLED_COUNT=$(dpkg-query -W -f='${Status}\n' $PACKAGES 2>/dev/null | grep -c "install ok installed" || true)
        EXPECTED_COUNT=$(echo $PACKAGES | wc -w)

        if [ "$INSTALLED_COUNT" -eq "$EXPECTED_COUNT" ]; then
            echo "✓ All essential packages are already installed (idempotent skip)"
        else
            echo "Some packages are missing or need update. Proceeding with installation..."
            sudo apt-get update
            sudo apt-get install -y $PACKAGES
        fi
        ;;
    dnf)
        # Individual packages to check (excluding group)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++"

        if rpm -q $PACKAGES >/dev/null 2>&1; then
            echo "✓ All essential packages are already installed (idempotent skip)"
        else
            echo "Some packages are missing. Proceeding with installation..."
            sudo dnf update -y
            sudo dnf install -y $PACKAGES @development-tools
        fi
        ;;
    pacman)
        PACKAGES="curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc"

        if pacman -Qq $PACKAGES >/dev/null 2>&1; then
            echo "✓ All essential packages are already installed (idempotent skip)"
        else
            echo "Some packages are missing. Proceeding with installation..."
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm $PACKAGES base-devel
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages check/installation complete"
