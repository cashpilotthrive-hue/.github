#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Optimized with idempotency check to avoid redundant updates and installs
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
            if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PACKAGES[*]}"
            sudo apt-get update
            sudo apt-get install -y "${MISSING_PACKAGES[@]}"
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    dnf)
        # Optimized with idempotency check
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

        MISSING_GROUP=""
        if ! dnf group list --installed "Development Tools" &>/dev/null; then
            MISSING_GROUP="@development-tools"
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ -n "$MISSING_GROUP" ]; then
            echo "Installing missing components..."
            sudo dnf update -y
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo dnf install -y "${MISSING_PACKAGES[@]}"
            [ -n "$MISSING_GROUP" ] && sudo dnf install -y "$MISSING_GROUP"
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    pacman)
        # Optimized with idempotency check
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

        MISSING_GROUP=""
        if ! pacman -Qg base-devel &>/dev/null; then
            MISSING_GROUP="base-devel"
        fi

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ -n "$MISSING_GROUP" ]; then
            echo "Installing missing packages..."
            sudo pacman -Syu --noconfirm
            [ ${#MISSING_PACKAGES[@]} -gt 0 ] && sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
            [ -n "$MISSING_GROUP" ] && sudo pacman -S --noconfirm "$MISSING_GROUP"
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
