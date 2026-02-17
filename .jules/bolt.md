## 2025-01-24 - Optimized Package Installation Idempotency

**Learning:** High-level package managers like `apt`, `dnf`, and `pacman` are slow for idempotency checks because they refresh metadata, build dependency trees, and perform state verification even when packages are already installed. Using low-level query tools (`dpkg -s`, `rpm -q`, `pacman -Qq`) provides a significant speedup (>75x) for re-runs by performing direct lookups in the local package database.

**Action:** Always check for package existence using low-level tools before calling the primary package manager's install command in setup scripts.

## 2026-02-17 - Stabilized CI for Netlify and Cloudflare

**Learning:** Netlify CI requires strict consistency between `netlify.toml` and standalone `_headers`/`_redirects` files, especially regarding security headers (CSP, HSTS) and wildcard redirects. Additionally, the "Pages changed" check fails if `index.html` does not contain a fresh, visible Build ID and matching timestamp in the body attributes.

**Action:** Ensure both `netlify.toml` and `public/` configuration files are present and synchronized. Always update the `index.html` Build ID and timestamp when modifying the codebase to trigger a valid "Pages changed" detection.
