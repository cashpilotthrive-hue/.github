#!/bin/bash
set -e

# Personal Linux System Setup Script
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALID_STEPS="packages devtools dotfiles system autocomplete"

show_help() {
    cat <<'HELP'
Usage: ./setup.sh [--only <step>] [--skip <step>] [--help]

Steps:
  packages      Install essential packages
  devtools      Install development tools
  dotfiles      Install dotfiles
  system        Apply system configuration
  autocomplete  Install bash completion for setup scripts

Examples:
  ./setup.sh
  ./setup.sh --only devtools
  ./setup.sh --skip autocomplete
HELP
}

is_valid_step() {
    local step=$1
    [[ " $VALID_STEPS " == *" $step "* ]]
}

ONLY_STEP=""
SKIP_STEP=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --help|-h)
            show_help
            exit 0
            ;;
        --only)
            if [[ -z "$2" ]]; then
                echo -e "${RED}Error: --only requires a step name.${NC}"
                exit 1
            fi
            ONLY_STEP="$2"
            shift 2
            ;;
        --skip)
            if [[ -z "$2" ]]; then
                echo -e "${RED}Error: --skip requires a step name.${NC}"
                exit 1
            fi
            SKIP_STEP="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Error: Unknown option '$1'${NC}"
            show_help
            exit 1
            ;;
    esac
done

if [[ -n "$ONLY_STEP" ]] && ! is_valid_step "$ONLY_STEP"; then
    echo -e "${RED}Error: Invalid step for --only: $ONLY_STEP${NC}"
    exit 1
fi

if [[ -n "$SKIP_STEP" ]] && ! is_valid_step "$SKIP_STEP"; then
    echo -e "${RED}Error: Invalid step for --skip: $SKIP_STEP${NC}"
    exit 1
fi

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Personal Linux System Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}Error: This script is designed for Linux systems only.${NC}"
    exit 1
fi

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

requires_sudo=false
if [[ "$ONLY_STEP" == "" || "$ONLY_STEP" == "packages" || "$ONLY_STEP" == "devtools" ]]; then
    if [[ "$SKIP_STEP" != "packages" && "$SKIP_STEP" != "devtools" ]]; then
        requires_sudo=true
    fi
fi

if [[ "$requires_sudo" == true ]]; then
    if ! sudo -n true 2>/dev/null; then
        echo -e "${YELLOW}This script requires sudo privileges. You may be prompted for your password.${NC}"
        sudo -v
    fi

    while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
    SUDO_KEEPALIVE_PID=$!
    trap 'kill "$SUDO_KEEPALIVE_PID" 2>/dev/null || true' EXIT
fi

run_step() {
    local step_name=$1
    local step_label=$2
    local command_path=$3
    local maybe_pkg=$4

    if [[ -n "$ONLY_STEP" && "$step_name" != "$ONLY_STEP" ]]; then
        return 0
    fi

    if [[ -n "$SKIP_STEP" && "$step_name" == "$SKIP_STEP" ]]; then
        echo -e "${YELLOW}Skipping ${step_name} step (--skip).${NC}"
        return 0
    fi

    echo -e "${GREEN}${step_label}${NC}"
    if [[ "$maybe_pkg" == "with-pkg" ]]; then
        "$command_path" "$PKG_MANAGER"
    else
        "$command_path"
    fi
}

echo -e "${GREEN}Detected package manager: ${PKG_MANAGER}${NC}"
echo ""

run_step "packages" "[1/5] Updating system packages..." "${SCRIPT_DIR}/scripts/install-packages.sh" "with-pkg"
run_step "devtools" "[2/5] Installing development tools..." "${SCRIPT_DIR}/scripts/install-devtools.sh" "with-pkg"
run_step "dotfiles" "[3/5] Setting up dotfiles..." "${SCRIPT_DIR}/scripts/setup-dotfiles.sh"
run_step "system" "[4/5] Configuring system settings..." "${SCRIPT_DIR}/scripts/configure-system.sh"
run_step "autocomplete" "[5/5] Installing shell autocomplete..." "${SCRIPT_DIR}/scripts/install-autocomplete.sh"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Note: Some changes may require logging out and back in.${NC}"
echo -e "${YELLOW}To apply bash changes immediately, run: source ~/.bashrc${NC}"
