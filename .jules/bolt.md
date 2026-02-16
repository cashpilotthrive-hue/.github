## 2026-02-10 - [FastAPI Blocking I/O Optimization]
**Learning:** Using 'async def' for route handlers that perform blocking synchronous I/O (like sqlite3 calls) blocks the FastAPI event loop, preventing other requests from being processed concurrently.
**Action:** Use standard 'def' for such handlers so FastAPI automatically runs them in a separate thread pool.

## 2026-02-10 - [SQLite WAL Mode]
**Learning:** Default SQLite configuration can be slow for concurrent write operations.
**Action:** Enable Write-Ahead Logging (WAL) mode to improve concurrent performance.

## 2026-02-15 - [SQLite Connection and Sync Optimization]
**Learning:** In a multi-threaded FastAPI environment, opening and closing SQLite connections on every request and using default synchronous settings (FULL) significantly limits throughput. Thread-local connection pooling combined with PRAGMA synchronous=NORMAL in WAL mode provides a major boost.
**Action:** Implement thread-local storage for SQLite connections and ensure PRAGMA synchronous=NORMAL is set on every connection in the pool.

## 2026-02-15 - [BackgroundTasks Overhead]
**Learning:** While BackgroundTasks are useful for offloading side effects, they introduce a measurable orchestration overhead. For extremely fast operations (like simple prints), calling them synchronously may be faster than scheduling them as background tasks.
**Action:** Benchmark before adding BackgroundTasks to high-throughput paths if the tasks themselves are trivial.
