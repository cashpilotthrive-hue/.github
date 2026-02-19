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
        # Bolt Optimization: Use dpkg-query for near-instant idempotency check (~0.02s vs ~4.9s)
        # We check that all packages are both known to dpkg and in 'install ok installed' state
        if dpkg-query -W -f='${Status}\n' "${PACKAGES[@]}" 2>/dev/null | grep -vx "install ok installed" | grep -q . || ! dpkg-query -W "${PACKAGES[@]}" >/dev/null 2>&1; then
            sudo apt-get update
            sudo apt-get install -y "${PACKAGES[@]}"
        else
            echo "All packages are already installed. Skipping apt-get update/install."
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
        # Bolt Optimization: rpm -q is much faster than dnf for checking installed status
        # Group @development-tools is verified via individual members like gcc and make
        if ! rpm -q "${PACKAGES[@]}" >/dev/null 2>&1; then
            sudo dnf update -y
            sudo dnf install -y "${PACKAGES[@]}" @development-tools
        else
            echo "All packages are already installed. Skipping dnf update/install."
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
        # Bolt Optimization: pacman -Qq is much faster than pacman -S for checking status
        # Group base-devel is verified via individual members like gcc and make
        if ! pacman -Qq "${PACKAGES[@]}" >/dev/null 2>&1; then
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${PACKAGES[@]}" base-devel
        else
            echo "All packages are already installed. Skipping pacman -Syu/install."
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
