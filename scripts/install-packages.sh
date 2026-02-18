#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        # Optimization: Check if packages are already installed to avoid slow apt-get calls
        # Expected speedup: ~70-100x for warm runs by using single-call dpkg-query
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release zip unzip jq make gcc g++)
        MISSING_PACKAGES=()

        # Efficient check: call dpkg-query once for all packages
        if dpkg-query -W -f='${Status}\n' "${PACKAGES[@]}" 2>/dev/null | grep -v "install ok installed" > /dev/null 2>&1 || \
           [ $(dpkg-query -W -f='${Status}\n' "${PACKAGES[@]}" 2>/dev/null | wc -l) -ne ${#PACKAGES[@]} ]; then
            for pkg in "${PACKAGES[@]}"; do
                if ! dpkg-query -W -f='${Status}\n' "$pkg" 2>/dev/null | grep -q "install ok installed"; then
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
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    dnf)
        # Optimization: Check if packages are already installed to avoid slow dnf calls
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc gcc-c++)
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! rpm -q "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PACKAGES[*]}"
            sudo dnf update -y
            sudo dnf install -y "${MISSING_PACKAGES[@]}" @development-tools
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    pacman)
        # Optimization: Check if packages are already installed to avoid slow pacman calls
        PACKAGES=(curl wget git vim neovim tmux htop tree ncdu zip unzip jq make gcc)
        MISSING_PACKAGES=()
        for pkg in "${PACKAGES[@]}"; do
            if ! pacman -Qq "$pkg" &>/dev/null; then
                MISSING_PACKAGES+=("$pkg")
            fi
        done

        if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PACKAGES[*]}"
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}" base-devel
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
