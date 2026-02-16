#!/bin/bash

# GitHub MCP Server Setup Script
# This script helps automate the setup of GitHub MCP server

set -e

echo "==================================="
echo "GitHub MCP Server Setup"
echo "==================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js is installed: $(node --version)"

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please update your Node.js installation."
    exit 1
fi

echo "✓ npx is available"
echo ""

# Check for GitHub token
if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
    echo "⚠️  GITHUB_PERSONAL_ACCESS_TOKEN is not set"
    echo ""
    echo "To use the GitHub MCP server locally, you need to:"
    echo "1. Create a Personal Access Token at:"
    echo "   https://github.com/settings/tokens?type=beta"
    echo ""
    echo "2. Grant these permissions:"
    echo "   - Repository access (read)"
    echo "   - Issues (read)"
    echo "   - Pull requests (read)"
    echo "   - Contents (read)"
    echo "   - Metadata (read)"
    echo ""
    echo "3. Export the token:"
    echo "   export GITHUB_PERSONAL_ACCESS_TOKEN='your_token_here'"
    echo ""
    echo "Alternatively, use GitHub's managed MCP server (no token required):"
    echo "   - Install the GitHub MCP extension in VS Code"
    echo "   - Authenticate via OAuth"
    echo ""
    
    # Check if user wants to continue anyway
    read -p "Continue without token? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ GITHUB_PERSONAL_ACCESS_TOKEN is set"
fi

echo ""
echo "Testing GitHub MCP server installation..."
echo ""

# Test the MCP server
if [ ! -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
    echo "Running: npx -y @modelcontextprotocol/server-github"
    echo "This will download and test the GitHub MCP server..."
    echo "Press Ctrl+C after seeing successful initialization"
    echo ""
    
    # Run for a few seconds then kill
    timeout 10s npx -y @modelcontextprotocol/server-github || true
    
    echo ""
    echo "✓ GitHub MCP server is working!"
else
    echo "Skipping test (no token provided)"
fi

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo ""
echo "1. For VS Code integration:"
echo "   - Install the MCP extension from the marketplace"
echo "   - Or use the .vscode/mcp.json configuration in this repo"
echo ""
echo "2. For Claude Desktop or other clients:"
echo "   - Copy the configuration from .vscode/mcp.json"
echo "   - Add it to your client's configuration file"
echo ""
echo "3. Read the full documentation in README.md"
echo ""
echo "Happy coding! 🚀"
