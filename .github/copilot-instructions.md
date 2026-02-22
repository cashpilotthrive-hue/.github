# GitHub Copilot Instructions

This file provides custom instructions for GitHub Copilot across all repositories in the `cashpilotthrive-hue` organization.

## General Guidelines

- Follow the repository's existing code style and conventions.
- Prefer clear, readable code over clever or overly compact code.
- Add comments for complex logic to improve maintainability.
- Follow security best practices: avoid hardcoding secrets, validate inputs, and handle errors properly.

## Shell Scripts

- Use `#!/usr/bin/env bash` as the shebang line.
- Include `set -euo pipefail` at the top of scripts for safety.
- Quote variables to prevent word splitting and globbing issues.
- Provide meaningful error messages when commands fail.

## Documentation

- Keep README files up to date with any new features or changes.
- Document function parameters and return values.
- Include usage examples where appropriate.
