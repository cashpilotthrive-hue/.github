#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Optimized for performance: Only install missing packages and skip update if not needed
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg lsb-release
            zip unzip jq make gcc g++
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
            echo "✓ All essential packages are already installed (skipped apt-get update)"
        fi
        ;;
    dnf)
        # Optimized for performance: Only install missing packages and skip update if not needed
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc gcc-c++
        )
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Check development-tools group separately
        DEV_TOOLS_MISSING=false
        if ! dnf group list --installed "Development Tools" &>/dev/null; then
             DEV_TOOLS_MISSING=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$DEV_TOOLS_MISSING" = true ]; then
            sudo dnf update -y
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo dnf install -y "${MISSING_PACKAGES[@]}"
            [ "$DEV_TOOLS_MISSING" = true ] && sudo dnf install -y @development-tools
        else
            echo "✓ All essential packages are already installed (skipped dnf update)"
        fi
        ;;
    pacman)
        # Optimized for performance: Only install missing packages and skip update if not needed
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc
        )
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Check base-devel group separately
        BASE_DEVEL_MISSING=false
        if ! pacman -Qg base-devel &>/dev/null; then
            BASE_DEVEL_MISSING=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$BASE_DEVEL_MISSING" = true ]; then
            sudo pacman -Syu --noconfirm
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
            [ "$BASE_DEVEL_MISSING" = true ] && sudo pacman -S --noconfirm base-devel
        else
            echo "✓ All essential packages are already installed (skipped pacman -Syu)"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages check complete"
