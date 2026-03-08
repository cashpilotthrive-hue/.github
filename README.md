# Kali Linux Autonomous System

This repository provides a safe-by-default scaffold to **automatically and repeatedly run an authorized security workflow**.

## What "autonomous loop" means here

The workflow is designed to:

1. Run pre-flight authorization checks.
2. Execute discovery and assessment phases.
3. Correlate and report outputs.
4. Repeat on a fixed interval without manual re-triggering.

> The loop only makes sense in environments where you have explicit permission to test.

## Quick Start (Activate the Workflow)

```bash
# 1) Configure policy and authorized targets
cp kali-autonomous/config/policy.env kali-autonomous/config/policy.local.env 2>/dev/null || true

# 2) Edit these files before running:
# - kali-autonomous/config/authorization.sig
# - kali-autonomous/config/targets.txt
# - kali-autonomous/config/policy.env

# 3) Single run (one full cycle)
./kali-autonomous/scripts/run_once.sh

# 4) Continuous autonomous loop
./kali-autonomous/scripts/loop.sh
```

## Directory Layout

```text
kali-autonomous/
  config/
    authorization.sig
    policy.env
    targets.txt
  scripts/
    lib.sh
    preflight.sh
    discover.sh
    assess.sh
    correlate.py
    report.py
    run_once.sh
    loop.sh
  output/
    raw/
    normalized/
    reports/
  logs/
  systemd/
```

## Automation Modes

### 1) Shell loop (immediate)

Use `loop.sh` for continuous operation:

```bash
./kali-autonomous/scripts/loop.sh
```

Behavior:

- Runs all phases in order.
- Sleeps for `LOOP_INTERVAL_SECONDS` between cycles.
- Optional stop condition with `MAX_RUNTIME_SECONDS`.

### 2) systemd timer (recommended for hosts)

Install unit files from `kali-autonomous/systemd/` and enable the timer:

```bash
sudo cp kali-autonomous/systemd/kali-autonomous.service /etc/systemd/system/
sudo cp kali-autonomous/systemd/kali-autonomous.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now kali-autonomous.timer
```

This repeatedly invokes `run_once.sh` on a schedule and keeps execution auditable.

## Guardrails (Enabled by Design)

- Hard fail if authorization artifact is missing.
- Hard fail if target allowlist is empty.
- Per-target throttling with `RATE_LIMIT_MILLISECONDS`.
- Intrusive testing controlled by `ENABLE_INTRUSIVE_TESTS=false` by default.
- Timestamped run directories and immutable-style logs for audit trails.

## Outputs Per Run

Each run writes a unique `run-<timestamp>` directory:

- Raw and normalized phase outputs
- Correlated findings (`correlated.json`)
- Human-readable report (`report.md`)
- Run log (`logs/run-<timestamp>/run.log`)

## Responsible Use

Use only on systems you are explicitly authorized to assess. Unauthorized scanning, testing, or exploitation is illegal and unethical.

## Troubleshooting Automated Agent Runs

If you run this repository from an external task runner/sandbox and see logs about missing or undefined default branches, validate Git metadata before starting:

```bash
# Show the current branch
git branch --show-current

# Confirm local + remote heads
git show-ref --heads --remotes

# Verify default branch from origin (if configured)
git remote show origin
```

Common fixes:

- Ensure the remote default branch is set correctly in the hosting provider.
- Explicitly pass a branch name to your automation runner instead of relying on auto-detection.
- If the automation produced "No changes made", this usually means the task ran successfully but generated no diff to commit.
