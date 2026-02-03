## 2026-02-03 - Eliminating Global Lock Contention in Load Balancer

**Learning:** Holding a lock while performing long-running or blocking operations (like `time.sleep()` or simulated network I/O) is a major performance anti-pattern. In this codebase, the `LoadBalancer` was holding its global lock while the `Server` was processing the request, effectively serializing all requests across all servers and neutralizing the benefits of a multi-server architecture. Additionally, using `try...finally` ensures that resources (like connection counts) are correctly released even if an error occurs during processing.

**Action:** Moved the `server.handle_request()` call outside the `LoadBalancer.lock` critical section in `route_request()`. Implemented `try...finally` in `Server.handle_request()` to ensure connection counts are safely decremented. This allows multiple servers to process requests concurrently while maintaining accurate load tracking.
