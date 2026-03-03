#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl
            wget
            git
            vim
            neovim
            tmux
            htop
            tree
            ncdu
            build-essential
            software-properties-common
            apt-transport-https
            ca-certificates
            gnupg
            lsb-release
            zip
            unzip
            jq
            make
            gcc
            g++
        )

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! dpkg-query -W "$pkg" >/dev/null 2>&1; then
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
            curl
            wget
            git
            vim
            neovim
            tmux
            htop
            tree
            ncdu
            zip
            unzip
            jq
            make
            gcc
            gcc-c++
        )

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Check for @development-tools group
        GROUP_MISSING=false
        if ! dnf group list --installed "Development Tools" | grep -q "Development Tools"; then
            GROUP_MISSING=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$GROUP_MISSING" = true ]; then
            sudo dnf update -y
            if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
                sudo dnf install -y "${MISSING_PACKAGES[@]}"
            fi
            if [ "$GROUP_MISSING" = true ]; then
                sudo dnf install -y @development-tools
            fi
        else
            echo "All essential packages and groups are already installed."
        fi
        ;;
    pacman)
        PACKAGES=(
            curl
            wget
            git
            vim
            neovim
            tmux
            htop
            tree
            ncdu
            zip
            unzip
            jq
            make
            gcc
        )

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        # Check for base-devel group
        GROUP_MISSING=false
        if ! pacman -Qg base-devel &>/dev/null; then
            GROUP_MISSING=true
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ "$GROUP_MISSING" = true ]; then
            sudo pacman -Syu --noconfirm
            if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
                sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
            fi
            if [ "$GROUP_MISSING" = true ]; then
                sudo pacman -S --noconfirm base-devel
            fi
        else
            echo "All essential packages and groups are already installed."
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
