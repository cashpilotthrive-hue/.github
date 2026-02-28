# Workflow Preview

## Current Workflow

### Test Linux Setup Scripts
- **File**: `.github/workflows/test-setup.yml`
- **Triggers**:
  - Push to `main` or `copilot/*` branches
  - Pull requests to `main`
  - Manual workflow dispatch

## Workflow Jobs

### Job 1: test-ubuntu
Runs on: `ubuntu-latest`

**Steps:**
1. ✅ Checkout repository
2. ✅ Verify script permissions
3. ✅ Test syntax of shell scripts
4. ✅ Verify dotfiles exist
5. ✅ Test script execution (dry-run)

### Job 2: validate-structure
Runs on: `ubuntu-latest`

**Steps:**
1. ✅ Checkout repository
2. ✅ Validate repository structure
3. ✅ Check README content

## What the Workflow Tests

### Script Validation
- Checks that all shell scripts have valid bash syntax
- Verifies scripts are executable
- Ensures no syntax errors in:
  - `setup.sh`
  - `scripts/install-packages.sh`
  - `scripts/install-devtools.sh`
  - `scripts/setup-dotfiles.sh`
  - `scripts/configure-system.sh`

### File Structure Validation
- Confirms all required directories exist:
  - `scripts/`
  - `dotfiles/`
  - `config/`
- Verifies essential files are present:
  - `setup.sh`
  - `README.md`
  - All dotfiles (`.bashrc`, `.gitconfig`, `.vimrc`, `.tmux.conf`)

### Content Validation
- Checks README contains expected content
- Validates project structure matches specification

## Workflow Badge

Add this badge to your README to show build status (replace `<owner>` and `<repo>` with your GitHub username and repository name):

```markdown
![Test Linux Setup Scripts](https://github.com/<owner>/<repo>/workflows/Test%20Linux%20Setup%20Scripts/badge.svg)
```

## Manual Trigger

To manually run the workflow:

1. Go to the **Actions** tab in GitHub
2. Select **Test Linux Setup Scripts**
3. Click **Run workflow**
4. Select the branch
5. Click **Run workflow**

## Notes

- The workflow does NOT perform actual system installation (requires sudo)
- It validates syntax and structure only
- Full integration testing requires a real Linux system
