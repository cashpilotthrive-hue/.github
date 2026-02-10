## 2026-02-10 - [FastAPI Blocking I/O Optimization]
**Learning:** Using 'async def' for route handlers that perform blocking synchronous I/O (like sqlite3 calls) blocks the FastAPI event loop, preventing other requests from being processed concurrently.
**Action:** Use standard 'def' for such handlers so FastAPI automatically runs them in a separate thread pool.

## 2026-02-10 - [SQLite WAL Mode]
**Learning:** Default SQLite configuration can be slow for concurrent write operations.
**Action:** Enable Write-Ahead Logging (WAL) mode to improve concurrent performance.
