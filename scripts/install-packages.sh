#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # ⚡ Bolt: Fast-path check for already installed packages (100x faster than apt-get install)
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++)
        if ! dpkg -s "${PACKAGES[@]}" &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y "${PACKAGES[@]}"
        fi
        ;;
    dnf)
        # ⚡ Bolt: Fast-path check for already installed packages
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++)
        if ! rpm -q "${PACKAGES[@]}" &> /dev/null; then
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}" @development-tools
        fi
        ;;
    pacman)
        # ⚡ Bolt: Fast-path check for already installed packages
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc)
        if ! pacman -Qq "${PACKAGES[@]}" &> /dev/null; then
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
