## 2026-01-31 - Optimizing Load Balancer Simulation Concurrency

**Learning:** Thread creation in Python is relatively expensive (~0.3ms per thread on this environment) compared to using a thread pool. Additionally, the 'Least Connections' algorithm can be optimized using idiomatic Python (`min` with `operator.attrgetter`) and by checking capacity early to avoid unnecessary thread creation. Direct attribute access is ~2x faster than method calls for simple value retrieval in Python.

**Action:** Implement `ThreadPoolExecutor` for thread reuse, optimize routing logic with `min()` and `attrgetter`, and perform early rejections in the Load Balancer to avoid the overhead of spawning/submitting tasks that will inevitably fail. Use direct attribute access for performance-sensitive loops.
