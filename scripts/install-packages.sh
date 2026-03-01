#!/bin/bash
set -e

PKG_MANAGER=${1:-apt}

echo "Installing essential packages..."

case "$PKG_MANAGER" in
    apt)
        sudo apt-get update
        sudo apt-get install -y \
            curl \
            wget \
            git \
            vim \
            neovim \
            tmux \
            htop \
            tree \
            ncdu \
            build-essential \
            software-properties-common \
            apt-transport-https \
            ca-certificates \
            gnupg \
            lsb-release \
            zip \
            unzip \
            jq \
            make \
            gcc \
            g++
        ;;
    dnf)
        sudo dnf update -y
        sudo dnf install -y \
            curl \
            wget \
            git \
            vim \
            neovim \
            tmux \
            htop \
            tree \
            ncdu \
            @development-tools \
            zip \
            unzip \
            jq \
            make \
            gcc \
            gcc-c++
        ;;
    pacman)
        sudo pacman -Syu --noconfirm
        sudo pacman -S --noconfirm \
            curl \
            wget \
            git \
            vim \
            neovim \
            tmux \
            htop \
            tree \
            ncdu \
            base-devel \
            zip \
            unzip \
            jq \
            make \
            gcc
        ;;
    *)
        echo "Unsupported package manager: $PKG_MANAGER"
        exit 1
        ;;
esac

echo "✓ Essential packages installed successfully"
