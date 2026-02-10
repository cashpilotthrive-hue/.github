# Load Balancer Simulation

High-performance Python simulation of a load balancer using the "Least Connections" strategy.

## Key Optimizations
- **Min-Heap Server Selection**: $O(1)$ selection and $O(\log N)$ updates.
- **Lock Contention Reduction**: Minimized the critical section by moving I/O and logging outside the lock.
- **Lazy Logging**: Reduced string formatting overhead.

## Usage
Run the simulation:
```bash
python3 load_balancer_simulation.py
```
