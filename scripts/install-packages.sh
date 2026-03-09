#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

# Helper functions for idempotency
check_apt() {
    for pkg in "$@"; do
        if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
            return 1
        fi
    done
    return 0
}

check_dnf() {
    for item in "$@"; do
        if [[ "$item" == @* ]]; then
            local group="${item#@}"
            if ! dnf group list --installed "$group" &>/dev/null; then
                return 1
            fi
        else
            if ! rpm -q "$item" &>/dev/null; then
                return 1
            fi
        fi
    done
    return 0
}

check_pacman() {
    for item in "$@"; do
        if pacman -Qg "$item" &>/dev/null; then
            continue
        fi
        if ! pacman -Qq "$item" &>/dev/null; then
            return 1
        fi
    done
    return 0
}

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg lsb-release
            zip unzip jq make gcc g++
        )
        if check_apt "${PACKAGES[@]}"; then
            echo "✓ All essential packages already installed"
        else
            sudo apt-get update
            sudo apt-get install -y "${PACKAGES[@]}"
        fi
        ;;
    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            @development-tools zip unzip jq make gcc gcc-c++
        )
        if check_dnf "${PACKAGES[@]}"; then
            echo "✓ All essential packages already installed"
        else
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}"
        fi
        ;;
    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            base-devel zip unzip jq make gcc
        )
        if check_pacman "${PACKAGES[@]}"; then
            echo "✓ All essential packages already installed"
        else
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${PACKAGES[@]}"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
