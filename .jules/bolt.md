## 2026-02-14 - [FastAPI Redundant Logic & Background Tasks]
**Learning:** Orchestrating endpoints often call multiple sub-endpoints, leading to redundant expensive operations (like moderation). Also, side effects like audit logging increase request latency unnecessarily.
**Action:** Use internal logic functions that accept optional pre-calculated results to avoid redundancy. Offload non-critical side effects to `BackgroundTasks` to improve response times and P95 stability.

## 2026-02-14 - [FastAPI Route Signature Pitfalls]
**Learning:** Adding internal-only parameters to a FastAPI route handler signature can cause FastAPI to interpret the body differently (treating single body params as part of a multi-param object), leading to 422 errors.
**Action:** Separate route handlers from internal logic functions to maintain a clean API and allow passing internal state without affecting request validation.
