## 2026-02-06 - [Lock Contention and CI Compatibility]
**Learning:** In the load balancer simulation, holding the global `LoadBalancer.lock` during server processing (which includes `time.sleep`) serializes all requests, causing a major performance bottleneck. Moving the processing outside the lock provides a ~16x speedup. Also, Netlify CI requires `public/` directory and `netlify.toml` to avoid deployment failures.
**Action:** Always move long-running tasks outside of global locks and ensure Netlify-specific files are present.

## 2026-02-07 - [Atomic Selection-Reservation Pattern]
**Learning:** Even with reduced lock contention, a race condition existed between server selection (Least Connections) and the actual increment of `active_connections`. Multiple threads could select the same nearly-full server before any of them incremented the count, leading to premature rejections.
**Action:** Implement a "Split-Lock" pattern where selection and reservation are performed as one atomic unit under the global lock, while processing remains outside.

## 2026-02-07 - [Logging Outside Critical Sections]
**Learning:** Logging operations are I/O-bound and slow. Holding a lock while logging significantly increases lock contention. Moving logging outside the lock by snapshotting state inside the lock improves throughput and reduces serialization.
**Action:** Move all logging and alert checks outside of the critical section while ensuring they use thread-safe snapshots of the state.
