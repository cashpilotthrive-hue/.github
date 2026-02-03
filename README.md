# Load Balancer Simulation

This repository contains a Python script, `load_balancer_simulation.py`, which simulates a 'Least Connections' load balancer.

## Performance Optimization

The simulation has been optimized to reduce lock contention. By separating the server selection and connection reservation from the actual request processing, the load balancer can route multiple requests concurrently across different servers.

## CI/CD Compatibility

The repository's CI/CD pipeline is configured for Netlify. To ensure CI checks pass, deployment assets are maintained in the `public/` directory.
