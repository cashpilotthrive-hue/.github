#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd .. && pwd)"

echo "Checking essential packages..."

# List of essential packages per manager
case "$PKG_MANAGER" in
    apt)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            build-essential software-properties-common
            apt-transport-https ca-certificates gnupg
            lsb-release zip unzip jq make gcc g++
        )
        ;;
    dnf)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            @development-tools zip unzip jq make gcc gcc-c++
        )
        ;;
    pacman)
        PACKAGES=(
            curl wget git vim neovim tmux htop tree ncdu
            base-devel zip unzip jq make gcc
        )
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

# Identify missing packages
MISSING_PACKAGES=()

if [ "$PKG_MANAGER" == "apt" ]; then
    # Bolt optimization: Batch dpkg-query calls to minimize process forks.
    # This significantly reduces execution time on warm runs (where most packages are already installed).
    declare -A STATUS_MAP
    while read -r line; do
        pkg_name="${line%% *}"
        pkg_status="${line#* }"
        if [[ "$pkg_status" == *"ok installed"* ]]; then
            STATUS_MAP["$pkg_name"]=1
        fi
    done < <(dpkg-query -W -f='${Package} ${Status}\n' "${PACKAGES[@]}" 2>/dev/null || true)

    for pkg in "${PACKAGES[@]}"; do
        if [[ -z "${STATUS_MAP[$pkg]}" ]]; then
            MISSING_PACKAGES+=("$pkg")
        fi
    done
else
    # Fallback for other package managers
    is_installed() {
        local pkg=$1
        case "$PKG_MANAGER" in
            dnf)
                if [[ "$pkg" == @* ]]; then return 1; fi
                rpm -q "$pkg" &>/dev/null
                ;;
            pacman)
                if [[ "$pkg" == "base-devel" ]]; then return 1; fi
                pacman -Qq "$pkg" &>/dev/null
                ;;
            *)
                return 1
                ;;
        esac
    }

    for pkg in "${PACKAGES[@]}"; do
        if ! is_installed "$pkg"; then
            MISSING_PACKAGES+=("$pkg")
        fi
    done
fi

if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
    echo "✓ All essential packages are already installed"
    exit 0
fi

echo "Installing missing packages: ${MISSING_PACKAGES[*]}..."

case "$PKG_MANAGER" in
    apt)
        sudo apt-get update
        sudo apt-get install -y "${MISSING_PACKAGES[@]}"
        ;;
    dnf)
        sudo dnf update -y
        sudo dnf install -y "${MISSING_PACKAGES[@]}"
        ;;
    pacman)
        sudo pacman -Syu --noconfirm
        sudo pacman -S --noconfirm "${MISSING_PACKAGES[@]}"
        ;;
esac

echo "✓ Essential packages installed successfully"
