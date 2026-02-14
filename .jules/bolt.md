## 2026-02-10 - [FastAPI Blocking I/O Optimization]
**Learning:** Using 'async def' for route handlers that perform blocking synchronous I/O (like sqlite3 calls) blocks the FastAPI event loop, preventing other requests from being processed concurrently.
**Action:** Use standard 'def' for such handlers so FastAPI automatically runs them in a separate thread pool.

## 2026-02-10 - [SQLite WAL Mode]
**Learning:** Default SQLite configuration can be slow for concurrent write operations.
**Action:** Enable Write-Ahead Logging (WAL) mode to improve concurrent performance.

## 2026-02-14 - [FastAPI Redundant Logic & Background Tasks]
**Learning:** Orchestrating endpoints often call multiple sub-endpoints, leading to redundant expensive operations (like moderation). Also, side effects like audit logging increase request latency unnecessarily.
**Action:** Use internal logic functions that accept optional pre-calculated results to avoid redundancy. Offload non-critical side effects to `BackgroundTasks` to improve response times and P95 stability.

## 2026-02-14 - [FastAPI Route Signature Pitfalls]
**Learning:** Adding internal-only parameters to a FastAPI route handler signature can cause FastAPI to interpret the body differently (treating single body params as part of a multi-param object), leading to 422 errors.
**Action:** Separate route handlers from internal logic functions to maintain a clean API and allow passing internal state without affecting request validation.
