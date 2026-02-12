## 2026-02-10 - [FastAPI Blocking I/O Optimization]
**Learning:** Using 'async def' for route handlers that perform blocking synchronous I/O (like sqlite3 calls) blocks the FastAPI event loop, preventing other requests from being processed concurrently.
**Action:** Use standard 'def' for such handlers so FastAPI automatically runs them in a separate thread pool.

## 2026-02-10 - [SQLite WAL Mode]
**Learning:** Default SQLite configuration can be slow for concurrent write operations.
**Action:** Enable Write-Ahead Logging (WAL) mode to improve concurrent performance.

## 2026-02-10 - [FastAPI BackgroundTasks for Non-Critical I/O]
**Learning:** Performing non-critical I/O operations (like event emission or audit logging) synchronously within a route handler increases the response latency for the user.
**Action:** Use FastAPI's `BackgroundTasks` to offload these operations, allowing the response to be returned immediately after critical work (like database persistence) is done.

## 2026-02-10 - [SQLite synchronous=NORMAL]
**Learning:** In WAL mode, setting `PRAGMA synchronous=NORMAL` significantly improves write performance while maintaining reasonable safety, as it reduces the number of fsyncs required.
**Action:** Set `PRAGMA synchronous=NORMAL` in addition to `PRAGMA journal_mode=WAL` for high-performance SQLite microservices.

## 2026-02-11 - [SQLite Per-Connection PRAGMAs]
**Learning:** Some SQLite PRAGMAs, like `synchronous`, are not persistent in the database file and must be set on every new connection. Setting them only in `init_db` is insufficient for subsequent request-level connections.
**Action:** Use a database connection helper or factory that ensures all required performance PRAGMAs are applied to every new connection.
