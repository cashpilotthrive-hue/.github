# GitHub MCP Quick Start Guide

Get started with GitHub MCP in 5 minutes!

## What You'll Need

- Visual Studio Code (or another MCP-compatible client)
- A GitHub account
- (Optional) GitHub Copilot subscription for managed MCP

## Quick Setup

### Method 1: Managed MCP (Easiest - No Token Required)

1. **Install VS Code Extension**
   ```
   Open VS Code → Extensions (Ctrl+Shift+X)
   Search for "MCP" or "@mcp"
   Install the GitHub MCP Server extension
   ```

2. **Authenticate**
   ```
   When prompted, authenticate with GitHub OAuth
   Grant the requested permissions
   ```

3. **Verify**
   ```
   Open Command Palette (Ctrl+Shift+P)
   Type "MCP: List Servers"
   Confirm "github" appears in the list
   ```

4. **Start Using**
   ```
   Open any GitHub repository
   Ask Copilot questions about your code, issues, or PRs
   ```

### Method 2: Local MCP Server (More Control)

1. **Create a GitHub Token**
   - Visit: https://github.com/settings/tokens?type=beta
   - Click "Generate new token"
   - Name: "MCP Server"
   - Repository access: Select repos you want to access
   - Permissions:
     - ✓ Contents (read)
     - ✓ Issues (read)
     - ✓ Pull requests (read)
     - ✓ Metadata (read)
   - Generate and copy the token

2. **Set Environment Variable**
   
   **On macOS/Linux:**
   ```bash
   echo 'export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"' >> ~/.zshrc
   source ~/.zshrc
   ```
   
   **On Windows (PowerShell):**
   ```powershell
   [System.Environment]::SetEnvironmentVariable('GITHUB_PERSONAL_ACCESS_TOKEN', 'ghp_your_token_here', 'User')
   ```

3. **Test the Server**
   ```bash
   # Clone this repository
   git clone https://github.com/cashpilotthrive-hue/.github.git
   cd .github
   
   # Run the setup script
   ./setup-mcp.sh
   ```

4. **Configure Your Client**
   
   Copy `.vscode/mcp.json` to your workspace or add to your client config:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
         }
       }
     }
   }
   ```

## Common Use Cases

### 1. Code Search
Ask your AI assistant:
- "Find all functions that handle authentication"
- "Where is the API endpoint for user registration?"
- "Show me how error handling is implemented"

### 2. Issue Management
- "What are the open high-priority issues?"
- "Show me issues labeled 'bug' from the last week"
- "What's the status of issue #123?"

### 3. Pull Request Review
- "Summarize the changes in PR #456"
- "What files were modified in the latest PR?"
- "Are there any merge conflicts?"

### 4. Repository Analysis
- "What's the commit history for this file?"
- "Who are the main contributors to this project?"
- "What branches exist in this repository?"

## Troubleshooting

### "Token not found" error
**Solution:** Ensure environment variable is set:
```bash
echo $GITHUB_PERSONAL_ACCESS_TOKEN  # Should show your token
```

### "Permission denied" error
**Solution:** Check your token has required scopes:
- Go to https://github.com/settings/tokens
- Edit your token and verify permissions

### "npx command not found"
**Solution:** Install or update Node.js:
- Download from https://nodejs.org/
- Minimum version: 16.x

### Rate limiting issues
**Solution:** 
- Use GitHub's managed MCP (higher rate limits)
- Or upgrade to a GitHub Pro account
- Check rate limit: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit`

## Best Practices

1. **Security First**
   - Never commit tokens to repositories
   - Use fine-grained tokens with minimal permissions
   - Rotate tokens regularly (every 90 days)
   - Use the managed MCP when possible (no token management)

2. **Performance**
   - Start with managed MCP for best performance
   - Cache repository data when using local servers
   - Use specific queries instead of broad searches

3. **Team Usage**
   - Share the `.vscode/mcp.json` configuration file
   - Document which repositories need access
   - Use organization-level tokens for shared resources

## Next Steps

- 📖 Read the full [README.md](README.md) for detailed documentation
- 🔧 Explore available tools and capabilities
- 🤝 Join the MCP community discussions
- 🚀 Integrate MCP into your workflow

## Resources

- [Official GitHub MCP Documentation](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [GitHub MCP Server on npm](https://www.npmjs.com/package/@modelcontextprotocol/server-github)
- [Community Examples](https://github.com/topics/model-context-protocol)

---

**Need Help?** Open an issue in this repository or check the [GitHub Community Forum](https://github.com/orgs/community/discussions).
