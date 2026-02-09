## 2026-02-03 - Optimizing Concurrency with Split-Lock Pattern

**Learning:** Moving a long-running operation outside of a global lock is essential for performance, but simply releasing the lock before the operation starts can introduce race conditions if state changes (like incrementing a counter) are not performed atomically with the selection.

**Action:** Implemented a split-lock pattern where the `Server` connection is reserved atomically within the `LoadBalancer`'s global lock. The actual processing is then performed outside the lock, and a separate atomic decrement occurs on completion. This maintains "Least Connections" accuracy while enabling true concurrent processing across servers.

**Impact:** Reduced total execution time of the 50-request simulation from ~100s (fully serialized) to ~33s (concurrent across 3 servers).

## 2026-02-09 - [Lock Contention and Threshold Pre-calculation]
**Learning:** Moving logging and error message construction outside of the global lock significantly reduces contention in high-load scenarios. Pre-calculating thresholds in the hot path avoids redundant calculations.
**Action:** Always move I/O and non-atomic operations outside of critical sections. Pre-calculate values that depend on constants.
