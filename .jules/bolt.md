# Bolt's Performance Journal

## 2026-06-28 - [Iterative Allocation Bottleneck]
**Learning:** In iterative parameter optimization (StrategyEngine.optimize), generating a full result object with a large 'results' array (1000+ rounds) for every iteration (100+ runs) is extremely expensive due to object allocation and GC pressure.
**Action:** Implement an `includeResults` flag in the core backtest engine to skip array population during optimization search. Perform one single high-fidelity backtest at the end only for the best-found parameters to maintain UI compatibility. This resulted in an ~82% speedup.

## 2026-06-28 - [String Conversion Overhead]
**Learning:** Using `toFixed()` inside core loops that execute thousands of times (like simulation rounds) introduces significant overhead due to numeric-to-string-to-numeric conversions.
**Action:** Use a pure mathematical rounding helper `_round(n, d) = Math.round(n * 10^d) / 10^d` to keep data as numbers until final display.
