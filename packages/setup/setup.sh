#!/bin/bash
set -e

# Personal Linux System Setup Script
# Author: cashpilotthrive-hue
# Description: Main setup script for personal Linux development environment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Personal Linux System Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}Error: This script is designed for Linux systems only.${NC}"
    exit 1
fi

# Check for sudo privileges
if ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}This script requires sudo privileges. You may be prompted for your password.${NC}"
    sudo -v
fi

# Keep sudo alive
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
SUDO_KEEPALIVE_PID=$!
trap 'kill "$SUDO_KEEPALIVE_PID" 2>/dev/null || true' EXIT

# Detect package manager
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
elif command -v pacman &> /dev/null; then
    PKG_MANAGER="pacman"
else
    echo -e "${RED}Error: Unsupported package manager. This script supports apt, dnf, and pacman.${NC}"
    exit 1
fi

echo -e "${GREEN}Detected package manager: ${PKG_MANAGER}${NC}"
echo ""

# Check if the system is fully ready before launching the setup
check_readiness() {
    local ready=true

    # Verify required commands are available
    for cmd in curl git; do
        if ! command -v "$cmd" &> /dev/null; then
            echo -e "${RED}Error: Required command '$cmd' is not installed.${NC}"
            ready=false
        fi
    done

    # Verify internet connectivity
    if ! curl -fsS --max-time 5 https://github.com > /dev/null 2>&1; then
        echo -e "${RED}Error: No internet connectivity detected.${NC}"
        ready=false
    fi

    if [ "$ready" = false ]; then
        echo -e "${RED}System is not ready. Please resolve the issues above and try again.${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ System readiness check passed${NC}"
    return 0
}

echo -e "${GREEN}Checking system readiness...${NC}"
if ! check_readiness; then
    exit 1
fi
echo ""

# Step 1: Update system
echo -e "${GREEN}[1/4] Updating system packages...${NC}"
"${SCRIPT_DIR}/scripts/install-packages.sh" "$PKG_MANAGER"

# Step 2: Install development tools
echo -e "${GREEN}[2/4] Installing development tools...${NC}"
"${SCRIPT_DIR}/scripts/install-devtools.sh" "$PKG_MANAGER"

# Step 3: Setup dotfiles
echo -e "${GREEN}[3/4] Setting up dotfiles...${NC}"
"${SCRIPT_DIR}/scripts/setup-dotfiles.sh"

# Step 4: Configure system
echo -e "${GREEN}[4/4] Configuring system settings...${NC}"
"${SCRIPT_DIR}/scripts/configure-system.sh"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Note: Some changes may require logging out and back in.${NC}"
echo -e "${YELLOW}To apply bash changes immediately, run: source ~/.bashrc${NC}"
