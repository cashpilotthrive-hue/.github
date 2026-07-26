# Skills Security Advisory: Hidden Unicode Instructions

## Why this matters

Agent Skills are a powerful extension point, but they also create a software supply-chain risk. A Skill can contain hidden Unicode characters (including Unicode Tag code points) that are invisible in common editors yet still interpreted by some models as executable instructions.

In practice, this means a Skill that appears harmless in human review can still carry malicious instructions, such as:

- forcing specific output text,
- triggering tool invocation,
- attempting command execution or data exfiltration.

## Threat model

When your agent platform supports Skills, attackers may target:

1. **Skill metadata** (name/description) loaded early in model context.
2. **Skill body instructions** that are only loaded when the Skill is invoked.
3. **Indirect supply-chain paths** (third-party Skill hubs, copied snippets, or modified forks).
4. **Tool-enabled Skills** where malicious instructions attempt to escalate into command execution.

## Hidden Unicode backdoor pattern

A common stealth technique is embedding invisible code points that encode attacker instructions. Human reviewers often miss these characters because they are not visibly rendered.

### Typical indicators

- Dense runs of invisible Unicode Tag characters.
- Unexpected zero-width characters in instruction-heavy sections.
- Suspicious instructions that only appear after decoding Unicode sequences.

## Defensive controls (recommended)

### 1) Scan Skills pre-install and in CI

Add automated scanning for:

- Unicode Tag ranges,
- zero-width characters,
- variant selectors and other suspicious control-like characters,
- ANSI escape sequences (optional/noisy).

Fail CI (or require manual approval) when high-risk patterns are detected, especially consecutive Unicode Tag runs.

### 2) Restrict tool execution blast radius

- Disable automatic approval for command-execution tools.
- Require explicit runtime approvals for Bash/shell/network actions.
- Run agents in sandboxed environments with least privilege.
- Scope secrets and environment access narrowly.

### 3) Enforce Skill provenance and lifecycle hygiene

- Allow only vetted Skill sources.
- Pin/review Skill versions before promotion.
- Periodically re-scan installed Skills.
- Remove Skills that are no longer needed.

### 4) Treat Skill text as untrusted input

- Assume both metadata and body content can be adversarial.
- Add policy checks around dangerous instruction patterns.
- Guard against prompt-injection attempts to override system policy.

## Minimal reviewer checklist

Before accepting or invoking a new Skill:

- [ ] Source is trusted and attributable.
- [ ] Skill file scanned for invisible/suspicious Unicode.
- [ ] Tool permissions are minimized.
- [ ] No hardcoded credential-handling instructions in prompts.
- [ ] Runtime approval policy is strict for command execution.

## Implementation note for this repository

If this repository introduces Skill automation in the future, add a dedicated scanner step in CI to inspect `SKILL.md` files and fail on high-confidence hidden-instruction signatures.
