## 2026-02-03 - Optimizing Concurrency with Split-Lock Pattern

**Learning:** Moving a long-running operation outside of a global lock is essential for performance, but simply releasing the lock before the operation starts can introduce race conditions if state changes (like incrementing a counter) are not performed atomically with the selection.

**Action:** Implemented a split-lock pattern where the `Server` connection is reserved atomically within the `LoadBalancer`'s global lock. The actual processing is then performed outside the lock, and a separate atomic decrement occurs on completion. This maintains "Least Connections" accuracy while enabling true concurrent processing across servers.

**Impact:** Reduced total execution time of the 50-request simulation from ~100s (fully serialized) to ~33s (concurrent across 3 servers).

## 2026-02-04 - Minimizing Lock Contention and Selection Overhead

**Learning:** Even in small simulations, moving I/O operations (logging) and floating-point divisions out of global locks significantly improves concurrent throughput. Early-exit logic in the server selection loop also reduces unnecessary iterations when idle servers are available.

**Action:** Refactored Server methods to capture state inside locks but perform logging outside. Implemented early-exit in LoadBalancer.select_server and pre-calculated load thresholds.

**Impact:** Reduced average simulation time from ~5.5s to ~5.1s (approx. 7% improvement) with just ~20 lines of targeted changes.
