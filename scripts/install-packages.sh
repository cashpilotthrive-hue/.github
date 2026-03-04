#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common apt-transport-https
            ca-certificates gnupg lsb-release zip unzip jq make gcc g++
        )
        # Fast idempotency check: only run apt-get if packages are missing or not fully installed
        if ! dpkg-query -W "${PACKAGES[@]}" >/dev/null 2>&1 || \
           dpkg-query -W -f='${Status}\n' "${PACKAGES[@]}" 2>/dev/null | grep -qv "install ok installed"; then
            sudo apt-get update
            sudo apt-get install -y "${PACKAGES[@]}"
        else
            echo "All essential packages are already installed (apt)"
        fi
        ;;
    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc gcc-c++
        )
        # Check if all packages and the development-tools group are installed
        MISSING_PACKAGES=0
        if ! rpm -q "${PACKAGES[@]}" &>/dev/null; then MISSING_PACKAGES=1; fi
        if ! dnf group list --installed "Development Tools" &>/dev/null; then MISSING_PACKAGES=1; fi

        if [ $MISSING_PACKAGES -eq 1 ]; then
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}" @development-tools
        else
            echo "All essential packages are already installed (dnf)"
        fi
        ;;
    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc
        )
        # Check if all packages and the base-devel group are installed
        MISSING_PACKAGES=0
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then MISSING_PACKAGES=1; break; fi
        done
        if [ $MISSING_PACKAGES -eq 0 ] && ! pacman -Qg base-devel &>/dev/null; then MISSING_PACKAGES=1; fi

        if [ $MISSING_PACKAGES -eq 1 ]; then
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${PACKAGES[@]}" base-devel
        else
            echo "All essential packages are already installed (pacman)"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
