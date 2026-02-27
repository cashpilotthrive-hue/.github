#!/bin/bash
start_time=$(python3 -c 'import time; print(time.time())')
./scripts/install-packages.sh apt > /dev/null 2>&1
end_time=$(python3 -c 'import time; print(time.time())')
echo "Duration: $(python3 -c "print($end_time - $start_time)") seconds"
