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
            # Use reliable check for package installation status on Ubuntu
            if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q 'ok installed'; then
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
        GROUPS=("development-tools")

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        MISSING_GROUPS=()
        for group in "${GROUPS[@]}"; do
            if ! dnf group list --installed "$group" &>/dev/null; then
                MISSING_GROUPS+=("@$group")
            fi
        done

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ ${#MISSING_GROUPS[@]} -gt 0 ]; then
            echo "Installing missing packages and groups..."
            sudo dnf update -y
            sudo dnf install -y "${MISSING_PACKAGES[@]}" "${MISSING_GROUPS[@]}"
        else
            echo "✓ All essential packages and groups are already installed"
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
        GROUPS=("base-devel")

        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        MISSING_GROUPS=()
        for group in "${GROUPS[@]}"; do
            if ! pacman -Qg "$group" &>/dev/null; then
                MISSING_GROUPS+=("$group")
            fi
        done

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ] || [ ${#MISSING_GROUPS[@]} -gt 0 ]; then
            echo "Installing missing packages and groups..."
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}" "${MISSING_GROUPS[@]}"
        else
            echo "✓ All essential packages and groups are already installed"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installation check complete"
