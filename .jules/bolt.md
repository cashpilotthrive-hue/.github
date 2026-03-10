# Bolt's Journal - Critical Learnings Only

## 2026-02-16 - Initial Performance Baseline
**Learning:** Running `apt-get update` and `apt-get install` on a warm environment (all packages already installed) takes ~5.6s. This contributes to a slow feedback loop during development or repeated setup runs.
**Action:** Implement robust idempotency checks to skip update and install commands when all target packages are already present.

## 2026-03-10 - CI Stability and Accurate Documentation
**Learning:** Restoring mandatory CI infrastructure files (`netlify.toml`, `public/*`, `wrangler.toml`) is essential to prevent deployment failures, but it must be done without introducing misleading documentation. Claiming unimplemented optimizations (e.g., SQLite WAL) in the UI is a significant maintenance risk and can lead to PR rejection.
**Action:** Always align UI documentation with the *actually implemented* changes. When restoring infrastructure from stable history, ensure any boilerplate content is updated to reflect the current state of the project.
