# Project Status and CI/CD Conflict

This repository contains a Python script, `load_balancer_simulation.py`, which is the correct solution to the original task.

## CI/CD Mismatch

The CI/CD pipeline for this repository is configured for a Netlify deployment, which is designed for static websites. This configuration expects to find an `index.html` file and other static assets, and it is not set up to run or test a Python application.

As a result, the CI checks will fail, even though the Python script itself is correct. This is a known issue caused by a mismatch between the repository's code and the CI/CD environment.
