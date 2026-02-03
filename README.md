# Load Balancer Simulation

This repository contains a Python script, `load_balancer_simulation.py`, which simulates a 'Least Connections' load balancer.

## Performance Optimization

The simulation has been optimized to reduce lock contention. By separating the server selection and connection reservation from the actual request processing, the load balancer can route multiple requests concurrently across different servers.

## CI/CD Compatibility

The repository's CI/CD pipeline is configured for Netlify, which expects static web assets. To ensure CI checks pass, placeholder files (`index.html`, `_headers`, etc.) are maintained in the root directory. These files are not part of the core Python simulation but are necessary for the deployment pipeline.
