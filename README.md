# .github Repository

This special repository contains default community health files and configuration templates for the **CashPilotThrive** organization.

## 📁 Repository Structure

### Community Health Files

These files are automatically applied to all public repositories in the organization that don't have their own:

- **CODE_OF_CONDUCT.md** - Code of Conduct for all projects
- **CONTRIBUTING.md** - Guidelines for contributing
- **SECURITY.md** - Security policy and vulnerability reporting
- **SUPPORT.md** - Support resources and how to get help
- **CODEOWNERS** - Default code owners

### Issue Templates

Located in `ISSUE_TEMPLATE/`:

- **bug_report.yml** - Template for bug reports
- **feature_request.yml** - Template for feature requests
- **config.yml** - Issue template configuration

### Pull Request Template

- **pull_request_template.md** - Default PR template

### Profile

- **profile/README.md** - Organization profile README displayed on the organization page

### Workflow Templates

Located in `workflow-templates/`:

- **ci.yml** - Node.js CI workflow template
- **python-ci.yml** - Python CI workflow template
- **release.yml** - Release automation workflow template

Each workflow has a corresponding `.properties.json` file that defines its metadata.

### Configuration Files

Located in `.github/`:

- **dependabot.yml** - Dependabot configuration for automated dependency updates
- **settings.yml** - Repository settings configuration (for use with Probot Settings app)
- **FUNDING.yml** - Sponsorship and funding information

## 🚀 How It Works

### Default Community Health Files

When a repository in the organization doesn't have its own community health file, GitHub automatically uses the version from this `.github` repository. This ensures consistent standards across all projects.

### Workflow Templates

Organization members can use these templates when creating new workflows in any repository:

1. Go to a repository in the organization
2. Click on "Actions" tab
3. Click "New workflow"
4. The templates from this repository will appear under "By [organization-name]"

### Issue Templates

These templates are automatically available in all repositories that don't define their own issue templates.

## 📝 Customization

### For Individual Repositories

If a repository needs different settings:

1. Create the same file in that repository (e.g., `CONTRIBUTING.md`)
2. The repository-specific version will override the organization default

### Updating Organization Defaults

To update organization-wide defaults:

1. Edit the files in this repository
2. Commit and push changes
3. Changes are automatically applied to all repositories using defaults

## 🔧 Maintenance

### Regular Updates

- Review and update templates quarterly
- Keep workflow templates up to date with latest GitHub Actions versions
- Update security policy as needed
- Ensure all links are working

### Testing

Before merging changes:

1. Test templates in a test repository
2. Verify YAML syntax for workflows
3. Check that all links resolve correctly

## 📚 Resources

- [GitHub Community Health Files Documentation](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [About issue and pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)
- [Creating workflow templates](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)

## 🤝 Contributing

To suggest improvements to organization-wide templates:

1. Open an issue in this repository
2. Describe the proposed change and rationale
3. Submit a pull request with the changes

## 📄 License

These templates and configurations are provided for use within the CashPilotThrive organization.

---

*Maintained with ❤️ by the CashPilotThrive team*
