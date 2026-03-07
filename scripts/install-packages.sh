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
        # Check if all packages are already installed
        if dpkg-query -W "${PACKAGES[@]}" >/dev/null 2>&1; then
            echo "All apt packages are already installed."
        else
            echo "Installing missing apt packages..."
            sudo apt-get update
            sudo apt-get install -y "${PACKAGES[@]}"
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
        # Check if all packages and the development-tools group are already installed
        if rpm -q "${PACKAGES[@]}" >/dev/null 2>&1 && dnf group list --installed "Development Tools" | grep -q "Development Tools" >/dev/null 2>&1; then
            echo "All dnf packages and groups are already installed."
        else
            echo "Installing missing dnf packages..."
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}" @development-tools
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
        # Check if all packages and the base-devel group are already installed
        if pacman -Qq "${PACKAGES[@]}" >/dev/null 2>&1 && pacman -Qg base-devel >/dev/null 2>&1; then
            echo "All pacman packages and groups are already installed."
        else
            echo "Installing missing pacman packages..."
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${PACKAGES[@]}" base-devel
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
