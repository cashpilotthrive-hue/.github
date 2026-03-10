#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

# Helper function to check if a package is installed
is_installed() {
    local pkg=$1
    case "$PKG_MANAGER" in
        apt)
            # Check using dpkg-query for robust apt-based detection
            dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q 'ok installed'
            ;;
        dnf|pacman)
            # Fallback to command -v for individual binaries.
            # Groups (e.g., @development-tools) will be marked as missing and re-checked by the manager.
            if [[ "$pkg" == "@"* ]] || [[ "$pkg" == "base-devel" ]]; then
                return 1
            fi
            command -v "$pkg" &>/dev/null
            ;;
        *)
            return 1
            ;;
    esac
}

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common apt-transport-https
            ca-certificates gnupg lsb-release zip unzip jq make gcc g++
        )

        MISSING_PKGS=()
        for pkg in "${PACKAGES[@]}"; do
            if ! is_installed "$pkg"; then
                MISSING_PKGS+=("$pkg")
            fi
        done

        if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PKGS[*]}"
            sudo apt-get update
            sudo apt-get install -y "${MISSING_PKGS[@]}"
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            @development-tools zip unzip jq make gcc gcc-c++
        )

        MISSING_PKGS=()
        for pkg in "${PACKAGES[@]}"; do
            if ! is_installed "$pkg"; then
                MISSING_PKGS+=("$pkg")
            fi
        done

        if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PKGS[*]}"
            sudo dnf update -y
            sudo dnf install -y "${MISSING_PKGS[@]}"
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            base-devel zip unzip jq make gcc
        )

        MISSING_PKGS=()
        for pkg in "${PACKAGES[@]}"; do
            if ! is_installed "$pkg"; then
                MISSING_PKGS+=("$pkg")
            fi
        done

        if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
            echo "Installing missing packages: ${MISSING_PKGS[*]}"
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm "${MISSING_PKGS[@]}"
        else
            echo "✓ All essential packages are already installed"
        fi
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages check complete"
