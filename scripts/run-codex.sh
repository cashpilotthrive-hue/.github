#!/bin/bash
set -e

echo "Running OpenAI Codex..."

# Check if Codex is installed
if ! command -v codex &> /dev/null && ! npm list -g @openai/codex &> /dev/null 2>&1; then
    echo "Error: OpenAI Codex is not installed."
    echo "Please run: sudo npm install -g @openai/codex"
    exit 1
fi

# Run Codex with any provided arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [codex-arguments]"
    echo "Example: $0 --help"
    echo ""
    echo "Running codex with default help:"
    npx @openai/codex --help
else
    npx @openai/codex "$@"
fi
