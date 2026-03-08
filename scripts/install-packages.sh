#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Packages to install via apt
        packages=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg lsb-release
            zip unzip jq make gcc g++
        )

        missing_packages=()
        for pkg in "${packages[@]}"; do
            # Check if package is installed and not in 'config-files' or 'not-installed' state
            if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q 'ok installed'; then
                missing_packages+=("$pkg")
            fi
        done

        if [ ${#missing_packages[@]} -gt 0 ]; then
            echo "Installing missing packages: ${missing_packages[*]}"
            sudo apt-get update
            sudo apt-get install -y "${missing_packages[@]}"
        else
            echo "All essential packages are already installed. Skipping..."
        fi
        ;;
    dnf)
        # Packages to install via dnf
        packages=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc gcc-c++
        )

        missing_packages=()
        for pkg in "${packages[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                missing_packages+=("$pkg")
            fi
        done

        # Check for development tools group
        # Use a "canary" package like binutils which is part of development tools
        missing_group=false
        if ! rpm -q binutils &>/dev/null; then
            missing_group=true
        fi

        if [ ${#missing_packages[@]} -gt 0 ] || [ "$missing_group" = true ]; then
            sudo dnf update -y
            if [ ${#missing_packages[@]} -gt 0 ]; then
                sudo dnf install -y "${missing_packages[@]}"
            fi
            if [ "$missing_group" = true ]; then
                sudo dnf install -y @development-tools
            fi
        else
            echo "All essential packages are already installed. Skipping..."
        fi
        ;;
    pacman)
        # Packages to install via pacman
        packages=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc
        )

        missing_packages=()
        for pkg in "${packages[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                missing_packages+=("$pkg")
            fi
        done

        # Check for base-devel group
        missing_group=false
        if ! pacman -Qg base-devel &>/dev/null; then
            missing_group=true
        fi

        if [ ${#missing_packages[@]} -gt 0 ] || [ "$missing_group" = true ]; then
            sudo pacman -Syu --noconfirm
            if [ ${#missing_packages[@]} -gt 0 ]; then
                sudo pacman -S --noconfirm "${missing_packages[@]}"
            fi
            if [ "$missing_group" = true ]; then
                sudo pacman -S --noconfirm base-devel
            fi
        else
            echo "All essential packages are already installed. Skipping..."
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
