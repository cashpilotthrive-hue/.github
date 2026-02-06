## 2026-02-06 - [Lock Contention and CI Compatibility]
**Learning:** In the load balancer simulation, holding the global `LoadBalancer.lock` during server processing (which includes `time.sleep`) serializes all requests, causing a major performance bottleneck. Moving the processing outside the lock provides a ~16x speedup. Also, Netlify CI requires `public/` directory and `netlify.toml` to avoid deployment failures.
**Action:** Always move long-running tasks outside of global locks and ensure Netlify-specific files are present.
