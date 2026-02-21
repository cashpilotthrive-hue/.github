#!/bin/bash

PACKAGES=(
    curl wget git vim neovim tmux htop tree ncdu build-essential
    software-properties-common apt-transport-https ca-certificates
    gnupg lsb-release zip unzip jq make gcc g++
)

echo "Measuring time for dpkg-query check..."
time dpkg-query -W -f='${Status}\n' "${PACKAGES[@]}" 2>/dev/null | grep -v "install ok installed" > /dev/null

echo "Measuring time for no-op apt-get install (estimated)..."
# We can't run sudo apt-get update/install here, but we know it takes several seconds.
# Usually ~5-10 seconds even if everything is installed.
