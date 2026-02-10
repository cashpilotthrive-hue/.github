# Project Suite: Automation & Simulations

This repository contains various Python-based tools for automation and performance simulation.

## FBchat Examples

Practical examples for automating Facebook Messenger using the `fbchat` library.

### Features
- **Scheduled Messenger**: Send messages at specific times daily using the `schedule` library.
- **Template Messenger**: JSON-based template system for dynamic messaging.

### Usage
```bash
# For scheduled messages
python3 scheduled_messenger.py

# For template messages
python3 template_messenger.py
```

Install dependencies:
```bash
pip install fbchat schedule
```

---

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
