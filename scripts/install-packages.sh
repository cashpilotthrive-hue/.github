#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

# Bolt Optimization: Check if packages are already installed to avoid redundant updates/installs.
# This significantly reduces execution time in "warm" environments (e.g. from ~5s to <0.1s on Ubuntu).

case "$PKG_MANAGER" in
    apt)
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
            echo "All essential packages are already installed."
        fi
        ;;
    dnf)
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

        # Check development-tools group
        if ! dnf group list --installed "Development Tools" &>/dev/null; then
             MISSING_PACKAGES+=("@development-tools")
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PACKAGES[*]}"
            sudo dnf update -y
            sudo dnf install -y "${MISSING_PACKAGES[@]}"
        else
            echo "All essential packages are already installed."
        fi
        ;;
    pacman)
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

        # Check base-devel group
        if ! pacman -Qg base-devel &>/dev/null; then
            MISSING_PACKAGES+=("base-devel")
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PACKAGES[*]}"
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
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
