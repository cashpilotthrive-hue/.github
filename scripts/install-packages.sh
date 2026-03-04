#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++)
        MISSING_PKGS=()
        for pkg in "${PACKAGES[@]}"; do
            if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
                MISSING_PKGS+=("$pkg")
            fi
        done

        if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PKGS[*]}"
            sudo apt-get update
            sudo apt-get install -y "${MISSING_PKGS[@]}"
        else
            echo "All packages already installed. Skipping..."
        fi
        ;;
    dnf)
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++)
        MISSING_PKGS=()
        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PKGS+=("$pkg")
            fi
        done

        # Check for development-tools group
        GROUP_MISSING=0
        if ! dnf group list --installed "Development Tools" &>/dev/null; then
            GROUP_MISSING=1
        fi

        if [ ${#MISSING_PKGS[@]} -gt 0 ] || [ $GROUP_MISSING -eq 1 ]; then
            echo "Installing missing packages/groups..."
            sudo dnf update -y
            [ ${#MISSING_PKGS[@]} -gt 0 ] && sudo dnf install -y "${MISSING_PKGS[@]}"
            [ $GROUP_MISSING -eq 1 ] && sudo dnf group install -y "Development Tools"
        else
            echo "All packages and groups already installed. Skipping..."
        fi
        ;;
    pacman)
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc)
        MISSING_PKGS=()
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PKGS+=("$pkg")
            fi
        done

        # Check for base-devel group
        GROUP_MISSING=0
        if ! pacman -Qg base-devel &>/dev/null; then
            GROUP_MISSING=1
        fi

        if [ ${#MISSING_PKGS[@]} -gt 0 ] || [ $GROUP_MISSING -eq 1 ]; then
            echo "Installing missing packages/groups..."
            sudo pacman -Syu --noconfirm
            [ ${#MISSING_PKGS[@]} -gt 0 ] && sudo pacman -S --noconfirm "${MISSING_PKGS[@]}"
            [ $GROUP_MISSING -eq 1 ] && sudo pacman -S --noconfirm base-devel
        else
            echo "All packages and groups already installed. Skipping..."
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
