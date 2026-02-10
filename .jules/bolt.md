## 2026-02-10 - Optimizing Load Balancer Simulation

**Learning:** Lock contention in multi-threaded Python simulations is often exacerbated by I/O and string formatting inside critical sections. Moving logging and f-string construction outside of locks significantly improves throughput. Additionally, pre-calculating constants and reducing attribute lookups in hot paths (like heap sifting) provides incremental gains that add up in high-frequency operations.

**Action:** Always audit 'with lock' blocks for any non-essential operations like logging, f-strings, or complex calculations. Pass captured state variables to methods outside the lock to maintain consistency without re-acquiring or re-reading state.
