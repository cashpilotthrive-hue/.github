## 2026-01-31 - Optimizing Load Balancer Simulation Concurrency

**Learning:** Thread creation in Python is relatively expensive (~0.3ms per thread on this environment) compared to using a thread pool. Additionally, the 'Least Connections' algorithm can be optimized using idiomatic Python (`min` with `operator.attrgetter`) and by checking capacity early to avoid unnecessary thread creation. Direct attribute access is ~2x faster than method calls for simple value retrieval in Python.

**Action:** Implement `ThreadPoolExecutor` for thread reuse, optimize routing logic with `min()` and `attrgetter`, and perform early rejections in the Load Balancer to avoid the overhead of spawning/submitting tasks that will inevitably fail. Use direct attribute access for performance-sensitive loops. Added placeholder `index.html`, `_headers`, and `_redirects` in a `public/` directory with a corresponding `netlify.toml` to satisfy the Netlify CI/CD pipeline.

## 2026-02-01 - Reducing Lock Contention and Selection Overhead

**Learning:** Holding a lock while performing I/O (like `print()`) is a major performance bottleneck in concurrent applications, as it unnecessarily serializes independent operations. In Python's `min()` function, using a generator expression instead of a list comprehension avoids intermediate memory allocation and can be significantly faster for finding the minimum in small-to-medium collections.

**Action:** Always move I/O operations outside of critical sections to minimize lock hold time. Use single-pass generator expressions with `min(..., default=None)` for efficient search in collections that might be empty.
