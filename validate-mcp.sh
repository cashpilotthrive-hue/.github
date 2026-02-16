#!/bin/bash

# GitHub MCP Validation Script
# This script validates your GitHub MCP setup

echo "==================================="
echo "GitHub MCP Setup Validator"
echo "==================================="
echo ""

VALIDATION_PASSED=0
VALIDATION_FAILED=0

# Function to report success
success() {
    echo "✓ $1"
    ((VALIDATION_PASSED++))
}

# Function to report failure
fail() {
    echo "✗ $1"
    ((VALIDATION_FAILED++))
}

# Function to report warning
warn() {
    echo "⚠ $1"
}

# Check Node.js
echo "Checking prerequisites..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js is installed: $NODE_VERSION"
else
    fail "Node.js is not installed"
fi

# Check npx
if command -v npx &> /dev/null; then
    success "npx is available"
else
    fail "npx is not available"
fi

echo ""
echo "Checking configuration files..."

# Check if mcp.json exists
if [ -f ".vscode/mcp.json" ]; then
    success ".vscode/mcp.json exists"
    
    # Validate JSON syntax
    if python3 -m json.tool .vscode/mcp.json > /dev/null 2>&1; then
        success "mcp.json is valid JSON"
    else
        fail "mcp.json has invalid JSON syntax"
    fi
else
    fail ".vscode/mcp.json not found"
fi

# Check if .gitignore exists and contains .env
if [ -f ".gitignore" ]; then
    success ".gitignore exists"
    if grep -q ".env" .gitignore; then
        success ".gitignore includes .env files"
    else
        warn ".gitignore should include .env files"
    fi
else
    warn ".gitignore not found"
fi

# Check if .env.example exists
if [ -f ".env.example" ]; then
    success ".env.example exists"
else
    warn ".env.example not found"
fi

echo ""
echo "Checking GitHub token..."

# Check for GitHub token
if [ ! -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
    success "GITHUB_PERSONAL_ACCESS_TOKEN is set"
    echo "  Note: Token validation skipped (run manually if needed)"
else
    warn "GITHUB_PERSONAL_ACCESS_TOKEN is not set (OK if using managed MCP)"
fi

echo ""
echo "Checking GitHub MCP server package..."

# Check if package is accessible
if npm view @modelcontextprotocol/server-github version > /dev/null 2>&1; then
    PACKAGE_VERSION=$(npm view @modelcontextprotocol/server-github version)
    success "GitHub MCP server package is accessible (v$PACKAGE_VERSION)"
else
    fail "Cannot access @modelcontextprotocol/server-github package"
fi

echo ""
echo "==================================="
echo "Validation Summary"
echo "==================================="
echo ""
echo "✓ Passed: $VALIDATION_PASSED"
echo "✗ Failed: $VALIDATION_FAILED"
echo ""

if [ $VALIDATION_FAILED -eq 0 ]; then
    echo "🎉 All checks passed! Your GitHub MCP setup looks good."
    echo ""
    echo "Next steps:"
    echo "1. Open VS Code in this directory"
    echo "2. Install the MCP extension (or configure your client)"
    echo "3. Start using GitHub MCP with your AI assistant"
    exit 0
else
    echo "⚠️  Some checks failed. Please review the errors above."
    echo ""
    echo "Common fixes:"
    echo "- Install Node.js from https://nodejs.org/"
    echo "- Set GITHUB_PERSONAL_ACCESS_TOKEN environment variable"
    echo "- Run: export GITHUB_PERSONAL_ACCESS_TOKEN='your_token'"
    echo ""
    echo "Or use GitHub's managed MCP (no token required):"
    echo "- Install the GitHub MCP extension in VS Code"
    echo "- Authenticate via OAuth"
    exit 1
fi
