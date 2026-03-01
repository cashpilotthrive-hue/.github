#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        sudo apt-get update
        sudo apt-get install -y \
            curl \
            wget \
            git \
            vim \
            neovim \
            tmux \
            htop \
            tree \
            ncdu \
            build-essential \
            software-properties-common \
            apt-transport-https \
            ca-certificates \
            gnupg \
            lsb-release \
            zip \
            unzip \
            jq \
            make \
            gcc \
            g++
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

# Install additional packages from config/packages.txt
PACKAGES_FILE="${SCRIPT_DIR}/config/packages.txt"
if [ -f "$PACKAGES_FILE" ]; then
    echo "Installing additional packages from config/packages.txt..."
    mapfile -t EXTRA_PACKAGES < <(grep -v '^#' "$PACKAGES_FILE" | grep -v '^[[:space:]]*$')
    if [ ${#EXTRA_PACKAGES[@]} -gt 0 ]; then
        case "$PKG_MANAGER" in
            apt)
                sudo apt-get install -y "${EXTRA_PACKAGES[@]}" || \
                    echo "Note: some packages from packages.txt may not be available via apt"
                ;;
            dnf)
                sudo dnf install -y "${EXTRA_PACKAGES[@]}" || \
                    echo "Note: some packages from packages.txt may not be available via dnf"
                ;;
            pacman)
                sudo pacman -S --noconfirm "${EXTRA_PACKAGES[@]}" || \
                    echo "Note: some packages from packages.txt may not be available via pacman"
                ;;
        esac
        echo "✓ Additional packages installed"
    fi
fi
