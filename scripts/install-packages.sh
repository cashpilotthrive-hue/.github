#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Installing essential packages..."

# Function to check if packages are installed
check_packages() {
    local packages=("$@")
    local missing=()

    case "$PKG_MANAGER" in
        apt)
            for pkg in "${packages[@]}"; do
                if ! dpkg-query -W -f='${Status}' "$pkg" 2>/dev/null | grep -q "ok installed"; then
                    missing+=("$pkg")
                fi
            done
            ;;
        dnf)
            for pkg in "${packages[@]}"; do
                if ! rpm -q "$pkg" &>/dev/null; then
                    # Check if it's a group
                    if [[ "$pkg" == "@"* ]]; then
                        group_name="${pkg#@}"
                        if ! dnf group list --installed "$group_name" | grep -qi "$group_name"; then
                            missing+=("$pkg")
                        fi
                    else
                        missing+=("$pkg")
                    fi
                fi
            done
            ;;
        pacman)
            for pkg in "${packages[@]}"; do
                if ! pacman -Qq "$pkg" &>/dev/null; then
                    # Check if it's a group
                    if ! pacman -Qg "$pkg" &>/dev/null; then
                        missing+=("$pkg")
                    fi
                fi
            done
            ;;
    esac
    echo "${missing[@]}"
}

case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg lsb-release
            zip unzip jq make gcc g++
        )

        MISSING_PACKAGES=$(check_packages "${PACKAGES[@]}")

        if [ -n "$MISSING_PACKAGES" ]; then
            echo "Missing packages: $MISSING_PACKAGES"
            sudo apt-get update
            sudo apt-get install -y $MISSING_PACKAGES
        else
            echo "✓ All essential packages already installed (skipping update/install)"
        fi
        ;;

    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            "@development-tools" zip unzip jq make gcc gcc-c++
        )

        MISSING_PACKAGES=$(check_packages "${PACKAGES[@]}")

        if [ -n "$MISSING_PACKAGES" ]; then
            echo "Missing packages: $MISSING_PACKAGES"
            sudo dnf update -y
            sudo dnf install -y $MISSING_PACKAGES
        else
            echo "✓ All essential packages already installed (skipping update/install)"
        fi
        ;;

    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            base-devel zip unzip jq make gcc
        )

        MISSING_PACKAGES=$(check_packages "${PACKAGES[@]}")

        if [ -n "$MISSING_PACKAGES" ]; then
            echo "Missing packages: $MISSING_PACKAGES"
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm $MISSING_PACKAGES
        else
            echo "✓ All essential packages already installed (skipping update/install)"
        fi
        ;;

    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages check/install complete"
