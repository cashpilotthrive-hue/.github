#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

# Helper function to check if a package is installed
is_installed() {
    local pkg=$1
    case "$PKG_MANAGER" in
        apt)
            dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q 'ok installed'
            ;;
        dnf)
            # For groups or special packages, assume they are missing
            if [[ "$pkg" == "@"* ]]; then
                return 1
            fi
            rpm -q "$pkg" &> /dev/null
            ;;
        pacman)
            # For groups or special packages, assume they are missing
            if [[ "$pkg" == "base-devel" ]]; then
                return 1
            fi
            pacman -Qq "$pkg" &> /dev/null
            ;;
        *)
            return 1
            ;;
    esac
}

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg lsb-release
            zip unzip jq make gcc g++
        )

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! is_installed "$pkg"; then
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
            @development-tools zip unzip jq make gcc gcc-c++
        )

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! is_installed "$pkg"; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

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
            base-devel zip unzip jq make gcc
        )

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! is_installed "$pkg"; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

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
