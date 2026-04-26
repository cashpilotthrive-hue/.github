#!/bin/bash
set -e

# Install bash completion for repository setup scripts.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPLETION_DIR="${HOME}/.local/share/bash-completion/completions"
COMPLETION_FILE="${COMPLETION_DIR}/personal-linux-setup"

mkdir -p "${COMPLETION_DIR}"

cat > "${COMPLETION_FILE}" <<'COMPLETION_EOF'
# shellcheck shell=bash
# Bash completion for Personal Linux System Setup scripts.

_personal_linux_setup_package_managers() {
    COMPREPLY=( $(compgen -W "apt dnf pacman" -- "${COMP_WORDS[COMP_CWORD]}") )
}

_personal_linux_setup_files() {
    local current
    current="${COMP_WORDS[COMP_CWORD]}"
    COMPREPLY=( $(compgen -f -- "${current}") )
}

_personal_linux_setup_setup_sh() {
    local current previous
    current="${COMP_WORDS[COMP_CWORD]}"
    previous="${COMP_WORDS[COMP_CWORD-1]}"

    case "${previous}" in
        --only|--skip)
            COMPREPLY=( $(compgen -W "packages devtools dotfiles system autocomplete" -- "${current}") )
            return 0
            ;;
    esac

    COMPREPLY=( $(compgen -W "--help --only --skip" -- "${current}") )
}

_personal_linux_setup_install_script_with_pkg() {
    _personal_linux_setup_package_managers
}

complete -F _personal_linux_setup_setup_sh setup.sh
complete -F _personal_linux_setup_install_script_with_pkg install-packages.sh
complete -F _personal_linux_setup_install_script_with_pkg install-devtools.sh
COMPLETION_EOF

echo "✓ Installed bash completion at ${COMPLETION_FILE}"
echo "  Reload your shell or run: source ~/.bashrc"

echo "  Completion targets: setup.sh, install-packages.sh, install-devtools.sh"

echo "  Tip: use TAB after '--only' or '--skip' for setup step names"
