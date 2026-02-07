# Load Balancer Simulation ⚡

A high-performance Python simulation of a 'Least Connections' load balancer.

## 🚀 Recent Optimizations

We've significantly reduced global lock contention by implementing an atomic selection-reservation pattern. This allows the simulation to process requests concurrently, resulting in a **19.5x speedup** (from ~98s down to ~5s for 50 requests).

## 🛠️ Usage

```bash
python3 load_balancer_simulation.py
```

## 🏗️ Architecture

- **Server**: Atomic connection management with capacity tracking.
- **LoadBalancer**: Thread-safe server selection using the Least Connections algorithm.
- **Simulation**: Concurrent request handling using `ThreadPoolExecutor`.

## 🌐 CI/CD

This project is configured for deployment on Netlify. Static assets are located in the `public/` directory.
