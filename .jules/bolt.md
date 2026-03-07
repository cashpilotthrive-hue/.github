## 2025-01-24 - [Multiline Regex Matching in Bash]
**Learning:** Bash's `[[ string =~ ^regex ]]` operator anchors the `^` to the start of the *entire* string, not the start of each line. For multiline variables, use `(^|$'\n')` to correctly identify the start of any line within the variable.
**Action:** Use `(^|$'\n')` instead of `^` when performing regex matches on multiline content stored in Bash variables to ensure correct line-level identification.
