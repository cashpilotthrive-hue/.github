#!/bin/bash
# benchmark_install.sh

PKG_MANAGER=${1:-apt}

echo "Measuring time for scripts/install-packages.sh with $PKG_MANAGER..."

# We might not be able to actually run sudo apt-get in this environment,
# but we can simulate or check if it's already fast.
# In a real environment, this would show the overhead.

START=$(python3 -c 'import time; print(time.time())')
./scripts/install-packages.sh "$PKG_MANAGER" > /dev/null 2>&1 || echo "Warning: Script failed (expected if not root)"
END=$(python3 -c 'import time; print(time.time())')

DURATION=$(python3 -c "print($END - $START)")
echo "Duration: $DURATION seconds"
