#!/bin/bash
# Benchmark script for install-packages.sh

PKG_MANAGER=${1:-apt}
echo "Running benchmark for $PKG_MANAGER..."

# Time the execution of install-packages.sh
START_TIME=$(python3 -c 'import time; print(time.time())')
./scripts/install-packages.sh "$PKG_MANAGER" > /dev/null 2>&1
END_TIME=$(python3 -c 'import time; print(time.time())')

# Calculate duration using python
DURATION=$(python3 -c "print($END_TIME - $START_TIME)")
echo "Execution time: $DURATION seconds"
