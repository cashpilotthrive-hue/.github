## 2026-02-07 - [Manual Loop vs. min() with Generator]
**Learning:** For hot paths involving small collections in Python, a manual `for` loop with direct attribute access can be significantly faster (~60% improvement) than using the idiomatic `min()` function with a generator expression. This is because it avoids the overhead of generator creation, generator iteration, and multiple function calls.
**Action:** Prefer simple loops for performance-critical selection logic when the number of elements is small.

## 2026-02-07 - [Async vs Sync for Non-Awaiting Methods]
**Learning:** Defining a method as `async def` when it does not contain any `await` expressions adds unnecessary overhead (coroutine creation). Converting such methods to standard `def` can improve efficiency without losing functionality, as long as the call site is also updated.
**Action:** Regularly audit asynchronous methods to see if they actually need to be async.
