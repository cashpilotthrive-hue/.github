## 2026-02-21 - Package Installation Idempotency Optimization
**Learning:** Using low-level tools like dpkg-query, rpm -q, and pacman -Qq to check for package existence BEFORE calling the package manager provides a ~50x speedup for the common case where packages are already installed. It avoids the overhead of locking the package database and checking repository lists.
**Action:** Always implement fast-path idempotency checks in setup scripts.
