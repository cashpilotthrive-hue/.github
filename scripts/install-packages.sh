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
        if dpkg -s "${PACKAGES[@]}" >/dev/null 2>&1; then
            echo "✓ Essential packages already installed (skipped)"
        else
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
            @development-tools
            zip
            unzip
            jq
            make
            gcc
            gcc-c++
        )
        # Use a subset of packages for the low-level check as rpm -q doesn't support groups (@)
        CHECK_PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++)
        if rpm -q "${CHECK_PACKAGES[@]}" >/dev/null 2>&1; then
            echo "✓ Essential packages already installed (skipped)"
        else
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}"
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
            base-devel
            zip
            unzip
            jq
            make
            gcc
        )
        # Use a subset of packages for the low-level check as pacman -Qq doesn't support groups
        CHECK_PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc)
        if pacman -Qq "${CHECK_PACKAGES[@]}" >/dev/null 2>&1; then
            echo "✓ Essential packages already installed (skipped)"
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
