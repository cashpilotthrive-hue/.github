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
        if ! dpkg -s "${PACKAGES[@]}" >/dev/null 2>&1; then
            echo "Installing missing apt packages..."
            sudo apt-get update
            sudo apt-get install -y "${PACKAGES[@]}"
        else
            echo "All essential apt packages already installed."
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
        if ! rpm -q "${PACKAGES[@]}" >/dev/null 2>&1; then
            echo "Installing missing dnf packages..."
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}" @development-tools
        else
            echo "All essential dnf packages already installed."
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
        if ! pacman -Qq "${PACKAGES[@]}" >/dev/null 2>&1; then
            echo "Installing missing pacman packages..."
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${PACKAGES[@]}" base-devel
        else
            echo "All essential pacman packages already installed."
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
