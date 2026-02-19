#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Low-level check for package presence to achieve idempotency with near-zero overhead
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++)
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
            echo "Installing missing packages for apt: ${MISSING_PACKAGES[*]}"
            sudo apt-get update
            sudo apt-get install -y "${MISSING_PACKAGES[@]}"
        fi
        ;;
    dnf)
        # Low-level check for package presence using rpm
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++)
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Check for development tools group
        INSTALL_GROUP=false
        if ! dnf group list --installed "@development-tools" &>/dev/null; then
            INSTALL_GROUP=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$INSTALL_GROUP" = true ]; then
            echo "Installing missing components for dnf..."
            sudo dnf update -y
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo dnf install -y "${MISSING_PACKAGES[@]}"
            [ "$INSTALL_GROUP" = true ] && sudo dnf install -y @development-tools
        fi
        ;;
    pacman)
        # Low-level check for package presence using pacman -Qq
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc)
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Check for base-devel group
        INSTALL_GROUP=false
        if ! pacman -Qg base-devel &>/dev/null; then
            INSTALL_GROUP=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$INSTALL_GROUP" = true ]; then
            echo "Installing missing components for pacman..."
            sudo pacman -Syu --noconfirm
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
            [ "$INSTALL_GROUP" = true ] && sudo pacman -S --noconfirm base-devel
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
