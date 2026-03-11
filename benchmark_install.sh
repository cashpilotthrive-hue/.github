#!/bin/bash
start_time=$(date +%s.%N)
./scripts/install-packages.sh apt > /dev/null 2>&1
end_time=$(date +%s.%N)
python3 -c "print(f'Execution time: {float($end_time) - float($start_time):.4f} seconds')"
