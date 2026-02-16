# GitHub Organization Configuration

This repository contains default community health files and configurations for the GitHub organization.

## GitHub MCP Server Setup

This repository is configured to use the GitHub Model Context Protocol (MCP) server, which enables AI assistants like GitHub Copilot to interact with GitHub repositories, issues, pull requests, and more.

### What is GitHub MCP?

The Model Context Protocol (MCP) is an open protocol that connects AI models with external tools and resources in a standardized way. The GitHub MCP server provides AI assistants with secure access to:

- Repository code and file contents
- Issues and pull requests
- Commit history and branches
- Code search capabilities
- CI/CD workflow information
- And more...

### Setup Options

#### Option 1: Using GitHub's Managed MCP Server (Recommended)

The easiest way to use GitHub MCP is through GitHub's managed endpoint:

1. **In Visual Studio Code:**
   - Open Extensions panel (`Ctrl+Shift+X` or `Cmd+Shift+X`)
   - Search for `@mcp` to find MCP Servers
   - Install the GitHub MCP server extension
   - Authenticate using OAuth when prompted

2. **Verify Setup:**
   - Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
   - Run `MCP: List Servers`
   - Confirm `github` appears in the configured servers list

No personal access token is required - authentication is handled via OAuth.

#### Option 2: Running a Local MCP Server

For more control or custom configurations, you can run a local MCP server:

1. **Prerequisites:**
   - Node.js installed (v16 or higher)
   - GitHub Personal Access Token with appropriate permissions

2. **Create a Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Click "Generate new token"
   - Set appropriate permissions:
     - Repository access (read)
     - Issues (read)
     - Pull requests (read)
     - Contents (read)
     - Metadata (read)
   - Copy the generated token

3. **Set Environment Variable:**
   ```bash
   export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
   ```

4. **Configure Your AI Client:**
   
   The `.vscode/mcp.json` file in this repository contains the configuration for local MCP server usage.
   
   For other clients (like Claude Desktop), add this to your client's configuration:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
         }
       }
     }
   }
   ```

5. **Test the Connection:**
   ```bash
   npx -y @modelcontextprotocol/server-github
   ```

### Security Best Practices

- **Never commit tokens:** Use environment variables or secure secret management
- **Use fine-grained tokens:** Limit permissions to only what's needed
- **Regular rotation:** Update tokens periodically
- **Trusted servers only:** Only add MCP servers from verified sources
- **Read-only when possible:** Start with minimal permissions and expand as needed

### Available Tools

The GitHub MCP server provides these capabilities:

- `search_code` - Search for code across repositories
- `search_repositories` - Find repositories by name or topic
- `search_issues` - Search for issues and pull requests
- `get_file_contents` - Read file contents from repositories
- `list_commits` - View commit history
- `get_pull_request` - Get PR details and diffs
- `list_issues` - List and filter issues
- `get_issue` - Get detailed issue information
- And more...

### Workspace Configuration

The `.vscode/mcp.json` file in this repository can be copied to any workspace to enable consistent GitHub MCP setup across your team.

### Troubleshooting

**Connection Issues:**
- Verify your token has the required permissions
- Check that the token hasn't expired
- Ensure `npx` and Node.js are properly installed

**Authentication Errors:**
- For managed servers: Re-authenticate through VS Code
- For local servers: Verify the `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable is set

**Performance:**
- The managed server is recommended for better performance
- Local servers may have rate limiting based on your token's limits

### Resources

- [GitHub MCP Documentation](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [VS Code MCP Integration](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
- [GitHub Blog: Practical Guide to GitHub MCP](https://github.blog/ai-and-ml/generative-ai/a-practical-guide-on-how-to-use-the-github-mcp-server/)

## Contributing

Please see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for our community guidelines.

## Security

If you discover a security issue, please see [SECURITY.md](SECURITY.md) for reporting instructions.
