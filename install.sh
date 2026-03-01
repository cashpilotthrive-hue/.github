#!/bin/bash
# Quick install script for personal Linux system setup
# Usage: curl -fsSL https://raw.githubusercontent.com/cashpilotthrive-hue/.github/main/install.sh | bash

set -e

REPO_URL="https://github.com/cashpilotthrive-hue/.github.git"
INSTALL_DIR="$HOME/.personal-linux-setup"

echo "================================"
echo "Personal Linux System Setup"
echo "Quick Install Script"
echo "================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git first:"
    echo "  Ubuntu/Debian: sudo apt install git"
    echo "  Fedora: sudo dnf install git"
    echo "  Arch: sudo pacman -S git"
    exit 1
fi

# Clone or update repository
if [ -d "$INSTALL_DIR" ]; then
    echo "Directory $INSTALL_DIR already exists. Updating..."
    cd "$INSTALL_DIR"
    git pull
else
    echo "Cloning repository to $INSTALL_DIR..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Make scripts executable
chmod +x setup.sh
chmod +x scripts/*.sh

echo ""
echo "Repository cloned successfully!"
echo ""

# Run setup automatically (hands-off mode)
echo "Starting automated setup..."
cd "$INSTALL_DIR"
./setup.sh
