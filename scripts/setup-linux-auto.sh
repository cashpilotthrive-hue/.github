#!/usr/bin/env bash
set -euo pipefail

# Automated Linux setup script (idempotent) for Debian/Ubuntu, Fedora, and Arch-based systems.
# Run with: sudo ./scripts/setup-linux-auto.sh

LOG_FILE="${LOG_FILE:-/var/log/linux-auto-setup.log}"
PACKAGES=(
  curl
  wget
  git
  vim
  htop
  unzip
  ca-certificates
  gnupg
  lsb-release
  ufw
  fail2ban
)

info() { printf '\n[INFO] %s\n' "$*"; }
warn() { printf '\n[WARN] %s\n' "$*"; }

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root: sudo $0"
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
exec > >(tee -a "$LOG_FILE") 2>&1

detect_pm() {
  if command -v apt-get >/dev/null 2>&1; then
    echo apt
  elif command -v dnf >/dev/null 2>&1; then
    echo dnf
  elif command -v pacman >/dev/null 2>&1; then
    echo pacman
  else
    echo unknown
  fi
}

install_packages() {
  local pm="$1"
  case "$pm" in
    apt)
      info "Updating apt cache..."
      apt-get update
      info "Installing packages with apt..."
      DEBIAN_FRONTEND=noninteractive apt-get install -y "${PACKAGES[@]}"
      ;;
    dnf)
      info "Installing packages with dnf..."
      dnf install -y "${PACKAGES[@]}"
      ;;
    pacman)
      info "Refreshing package database and installing packages with pacman..."
      pacman -Sy --noconfirm --needed "${PACKAGES[@]}"
      ;;
    *)
      warn "Unsupported package manager. Skipping package installation."
      ;;
  esac
}

enable_service_if_exists() {
  local service="$1"
  if systemctl list-unit-files | awk '{print $1}' | grep -Fxq "$service"; then
    info "Enabling and starting $service"
    systemctl enable --now "$service"
  else
    warn "Service $service not found. Skipping."
  fi
}

setup_firewall() {
  if command -v ufw >/dev/null 2>&1; then
    info "Configuring UFW defaults..."
    ufw default deny incoming || true
    ufw default allow outgoing || true
    ufw allow OpenSSH || true
    ufw --force enable || true
  else
    warn "ufw not installed, skipping firewall setup."
  fi
}

setup_fail2ban() {
  if command -v fail2ban-client >/dev/null 2>&1; then
    enable_service_if_exists fail2ban.service
  else
    warn "fail2ban not installed, skipping fail2ban setup."
  fi
}

main() {
  info "Starting Linux auto setup"

  local pm
  pm="$(detect_pm)"
  info "Detected package manager: $pm"

  install_packages "$pm"
  setup_firewall
  setup_fail2ban

  info "Setup complete. Review logs at $LOG_FILE"
}

main "$@"
