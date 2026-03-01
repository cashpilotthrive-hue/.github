#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

# Optimization: Check if packages are already installed to avoid unnecessary updates and installs
# Bolt's Philosophy: Every millisecond counts. Skipping package manager updates can save seconds.

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg lsb-release
            zip unzip jq make gcc g++
        )
        if dpkg-query -W "${PACKAGES[@]}" > /dev/null 2>&1; then
            echo "✓ All essential packages are already installed"
            exit 0
        fi

        sudo apt-get update
        sudo apt-get install -y "${PACKAGES[@]}"
        ;;
    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc gcc-c++
        )
        # Check individual packages and the development-tools group
        if rpm -q "${PACKAGES[@]}" > /dev/null 2>&1 && \
           dnf group list --installed "Development Tools" > /dev/null 2>&1; then
            echo "✓ All essential packages are already installed"
            exit 0
        fi

        sudo dnf update -y
        sudo dnf install -y "${PACKAGES[@]}" @development-tools
        ;;
    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc
        )
        # Check individual packages and the base-devel group
        if pacman -Qq "${PACKAGES[@]}" > /dev/null 2>&1 && \
           pacman -Qg base-devel > /dev/null 2>&1; then
            echo "✓ All essential packages are already installed"
            exit 0
        fi

        sudo pacman -Syu --noconfirm
        sudo pacman -S --noconfirm "${PACKAGES[@]}" base-devel
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
