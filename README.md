# Load Balancer Simulation

This repository contains a Python script, `load_balancer_simulation.py`, which simulates a 'Least Connections' load balancer.

## Python Simulation

The core logic is in `load_balancer_simulation.py`. It uses a `ThreadPoolExecutor` to handle concurrent requests and assigns them to the server with the fewest active connections.

### Running the Simulation

```bash
python3 load_balancer_simulation.py
```

## CI/CD and Netlify

The CI/CD pipeline for this repository is configured for Netlify (a static site hosting service). To ensure the CI checks pass, several placeholder files have been added to the `public/` directory (with `netlify.toml` in the root):
- `public/index.html`
- `public/_headers`
- `public/_redirects`

These files are only present to satisfy the deployment requirements of the current CI environment and are not part of the Python application's functional logic.
