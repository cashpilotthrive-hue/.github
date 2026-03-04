# Bolt Journal

## 2024-05-22: Consolidating I/O Appends in Shell Scripts

**Learning:** Replacing multiple individual redirection appends (`>>`) with a single heredoc block (`cat << 'EOF' >> file`) reduces the number of file open/close system calls. While `cat` is an external process and might be slower in a high-iteration synthetic benchmark loop compared to shell built-ins, for single-shot scripts it is more idiomatic and provides a cleaner way to handle multi-line appends while still reducing total I/O operations.

**Action:** Use heredocs for multi-line appends to files in shell scripts to improve readability and reduce I/O syscalls. Use quoted delimiters (`'EOF'`) to prevent unintended shell expansion.
