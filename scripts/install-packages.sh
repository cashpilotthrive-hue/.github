#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common apt-transport-https
            ca-certificates gnupg lsb-release zip unzip jq make gcc g++
        )
        if dpkg-query -W "${PACKAGES[@]}" >/dev/null 2>&1; then
            echo "All essential packages already installed"
        else
            sudo apt-get update
            sudo apt-get install -y "${PACKAGES[@]}"
        fi
        ;;
    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc gcc-c++
        )
        GROUPS=("development-tools")
        MISSING=0
        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" >/dev/null 2>&1; then MISSING=1; break; fi
        done
        if [ $MISSING -eq 0 ]; then
            for group in "${GROUPS[@]}"; do
                if ! dnf group list --installed "$group" >/dev/null 2>&1; then MISSING=1; break; fi
            done
        fi

        if [ $MISSING -eq 0 ]; then
            echo "All essential packages and groups already installed"
        else
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}"
            for group in "${GROUPS[@]}"; do
                sudo dnf group install -y "$group"
            done
        fi
        ;;
    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            zip unzip jq make gcc
        )
        GROUPS=("base-devel")
        MISSING=0
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" >/dev/null 2>&1; then MISSING=1; break; fi
        done
        if [ $MISSING -eq 0 ]; then
            for group in "${GROUPS[@]}"; do
                if ! pacman -Qg "$group" >/dev/null 2>&1; then MISSING=1; break; fi
            done
        fi

        if [ $MISSING -eq 0 ]; then
            echo "All essential packages and groups already installed"
        else
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${PACKAGES[@]}"
            for group in "${GROUPS[@]}"; do
                sudo pacman -S --noconfirm "$group"
            done
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
