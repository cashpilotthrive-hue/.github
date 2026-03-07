#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Check which packages are already installed to avoid unnecessary updates and installs
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common apt-transport-https
            ca-certificates gnupg lsb-release zip unzip jq make gcc g++
        )
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PACKAGES[*]}"
            sudo apt-get update
            sudo apt-get install -y "${MISSING_PACKAGES[@]}"
        else
            echo "✓ All essential packages are already installed (apt)"
        fi
        ;;
    dnf)
        # Check for development tools group and individual packages
        MISSING_PACKAGES=()
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++)

        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Use binutils as a canary for development tools
        if ! rpm -q binutils &>/dev/null; then
             MUST_INSTALL_GROUP=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$MUST_INSTALL_GROUP" = true ]; then
            sudo dnf update -y
            [ "$MUST_INSTALL_GROUP" = true ] && sudo dnf group install -y "Development Tools"
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo dnf install -y "${MISSING_PACKAGES[@]}"
        else
            echo "✓ All essential packages and tools are already installed (dnf)"
        fi
        ;;
    pacman)
        # Check for base-devel and individual packages
        MISSING_PACKAGES=()
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc)

        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Use binutils as a canary for base-devel
        if ! pacman -Qq binutils &>/dev/null; then
            MUST_INSTALL_GROUP=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$MUST_INSTALL_GROUP" = true ]; then
            sudo pacman -Syu --noconfirm
            [ "$MUST_INSTALL_GROUP" = true ] && sudo pacman -S --noconfirm base-devel
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
        else
            echo "✓ All essential packages and tools are already installed (pacman)"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
