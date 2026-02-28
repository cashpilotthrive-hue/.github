#!/bin/bash
# Dashboard: Overview of system users and installed development tools

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_section() {
    echo ""
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_tool() {
    local name=$1
    local cmd=$2
    local version_flag=${3:---version}
    if command -v "$cmd" &> /dev/null; then
        local ver
        ver=$("$cmd" $version_flag 2>&1 | head -n1)
        echo -e "  ${GREEN}✓${NC} ${name}: ${ver}"
    else
        echo -e "  ${RED}✗${NC} ${name}: not installed"
    fi
}

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║        System Dashboard                  ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════╝${NC}"

# ── System Information ──────────────────────────────────────────────────────
print_section "System Information"
echo -e "  ${CYAN}Hostname:${NC}   $(hostname)"
echo -e "  ${CYAN}OS:${NC}         $(grep -oP '(?<=^PRETTY_NAME=).+' /etc/os-release 2>/dev/null | tr -d '"' || uname -s)"
echo -e "  ${CYAN}Kernel:${NC}     $(uname -r)"
echo -e "  ${CYAN}Uptime:${NC}     $(uptime -p 2>/dev/null || uptime)"
echo -e "  ${CYAN}Memory:${NC}     $(free -h 2>/dev/null | awk '/^Mem:/{print $3 " used / " $2 " total"}' || echo "N/A")"
echo -e "  ${CYAN}Disk (/):${NC}   $(df -h / 2>/dev/null | awk 'NR==2{print $3 " used / " $2 " total (" $5 " used)"}' || echo "N/A")"

# ── System Users ─────────────────────────────────────────────────────────────
print_section "System Users"
echo -e "  ${YELLOW}Login-capable users (shell access):${NC}"
while IFS=: read -r username _ uid _ gecos home shell; do
    # Skip system accounts (uid < 1000) and nologin/false shells
    if [[ "$uid" -ge 1000 ]] && [[ "$shell" != */nologin ]] && [[ "$shell" != */false ]]; then
        echo -e "    ${GREEN}•${NC} ${username} (uid=${uid}, home=${home})"
    fi
done < /etc/passwd

echo ""
echo -e "  ${YELLOW}Currently logged-in users:${NC}"
if command -v who &> /dev/null; then
    who | awk '{print "    \033[0;32m•\033[0m " $1 " (tty=" $2 ")"}' || echo "    (none)"
else
    echo "    (who command not available)"
fi

echo ""
echo -e "  ${YELLOW}Users with sudo privileges:${NC}"
if getent group sudo &>/dev/null; then
    sudo_members=$(getent group sudo | cut -d: -f4)
    [ -n "$sudo_members" ] && echo -e "    ${GREEN}•${NC} sudo group: ${sudo_members}"
fi
if getent group wheel &>/dev/null; then
    wheel_members=$(getent group wheel | cut -d: -f4)
    [ -n "$wheel_members" ] && echo -e "    ${GREEN}•${NC} wheel group: ${wheel_members}"
fi
if [ -d /etc/sudoers.d ]; then
    # Only read files we have permission to access; errors are suppressed
    grep -rlE '^[^#%][^ ]+ ' /etc/sudoers.d/ 2>/dev/null | while read -r f; do
        grep -E '^[^#%][^ ]+ .*ALL' "$f" 2>/dev/null | awk '{print "    \033[0;32m•\033[0m " $1 " (sudoers.d)"}' || true
    done
fi

# ── Installed Development Tools ──────────────────────────────────────────────
print_section "Installed Development Tools"
check_tool "Git"            git             "--version"
check_tool "Node.js"        node            "--version"
check_tool "npm"            npm             "--version"
check_tool "Python 3"       python3         "--version"
check_tool "pip"            pip3            "--version"
check_tool "Docker"         docker          "--version"
check_tool "Docker Compose" docker-compose  "--version"
check_tool "GitHub CLI"     gh              "--version"
check_tool "Vim"            vim             "--version"
check_tool "tmux"           tmux            "-V"
check_tool "curl"           curl            "--version"
check_tool "wget"           wget            "--version"
check_tool "htop"           htop            "--version"

# ── Running Services ─────────────────────────────────────────────────────────
print_section "Key Running Services"
services=(docker ssh nginx apache2 mysql postgresql)
if command -v systemctl &> /dev/null; then
    for svc in "${services[@]}"; do
        if systemctl list-units --type=service 2>/dev/null | grep -q "${svc}.service"; then
            status=$(systemctl is-active "$svc" 2>/dev/null)
            if [ "$status" = "active" ]; then
                echo -e "  ${GREEN}✓${NC} ${svc}: running"
            else
                echo -e "  ${YELLOW}○${NC} ${svc}: ${status}"
            fi
        fi
    done
else
    echo "  (systemctl not available)"
fi

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║  Dashboard complete                      ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
