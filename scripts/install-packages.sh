#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Checking essential packages..."

# List of essential packages per manager
case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg
            lsb-release zip unzip jq make gcc g++
        )
        ;;
    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            @development-tools zip unzip jq make gcc gcc-c++
        )
        ;;
    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            base-devel zip unzip jq make gcc
        )
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

# Identify missing packages
MISSING_PACKAGES=()

case "$PKG_MANAGER" in
    apt)
        # Batch check for apt - significantly faster than individual calls
        # Use an associative array to store installation status
        declare -A pkg_status
        while read -r pkg status; do
            if [[ "$status" == "install ok installed" ]]; then
                pkg_status["$pkg"]=1
            fi
        done < <(dpkg-query -W -f='${Package} ${Status}\n' "${PACKAGES[@]}" 2>/dev/null || true)

        for pkg in "${PACKAGES[@]}"; do
            if [[ -z "${pkg_status[$pkg]}" ]]; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done
        ;;
    dnf)
        for pkg in "${PACKAGES[@]}"; do
            if [[ "$pkg" == @* ]]; then
                MISSING_PACKAGES+=("$pkg")
            elif ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done
        ;;
    pacman)
        for pkg in "${PACKAGES[@]}"; do
            if [[ "$pkg" == "base-devel" ]]; then
                MISSING_PACKAGES+=("$pkg")
            elif ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done
        ;;
esac

if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
    echo "✓ All essential packages are already installed"
    exit 0
fi

echo "Installing missing packages: ${MISSING_PACKAGES[*]}..."

case "$PKG_MANAGER" in
    apt)
        sudo apt-get update
        sudo apt-get install -y "${MISSING_PACKAGES[@]}"
        ;;
    dnf)
        sudo dnf update -y
        sudo dnf install -y "${MISSING_PACKAGES[@]}"
        ;;
    pacman)
        sudo pacman -Syu --noconfirm
        sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
        ;;
esac

echo "✓ Essential packages installed successfully"
