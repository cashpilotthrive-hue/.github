## 2026-02-09 - [Lock Contention and Threshold Pre-calculation]
**Learning:** Moving logging and error message construction outside of the global lock significantly reduces contention in high-load scenarios. Pre-calculating thresholds in the hot path avoids redundant calculations.
**Action:** Always move I/O and non-atomic operations outside of critical sections. Pre-calculate values that depend on constants.
