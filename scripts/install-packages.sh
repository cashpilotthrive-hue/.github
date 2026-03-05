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
        sudo dnf update -y
        sudo dnf install -y \
            curl \
            wget \
            git \
            vim \
            neovim \
            tmux \
            htop \
            tree \
            ncdu \
            @development-tools \
            zip \
            unzip \
            jq \
            make \
            gcc \
            gcc-c++
        ;;
    pacman)
        sudo pacman -Syu --noconfirm
        sudo pacman -S --noconfirm \
            curl \
            wget \
            git \
            vim \
            neovim \
            tmux \
            htop \
            tree \
            ncdu \
            base-devel \
            zip \
            unzip \
            jq \
            make \
            gcc
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
