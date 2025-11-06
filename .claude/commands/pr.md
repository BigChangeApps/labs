---
description: "Create a pull request with full validation checks"
---

Create a pull request with comprehensive validation and proper PR documentation.

**Validation Process:**

1. Run complete validation suite:
   - `tsc --noEmit` - Type checking (catches type errors)
   - `pnpm run lint` - Linting (code quality checks)
   - `pnpm run build` - Full build (ensures everything compiles and bundles correctly)

2. If any check fails, STOP immediately and report errors to the user. Do NOT create a PR with failing checks.

3. If all checks pass, proceed with PR creation workflow:
   - Run `git status` to see all untracked files
   - Run `git diff --staged` and `git diff` to see both staged and unstaged changes
   - Check if current branch tracks a remote and is up to date
   - Run `git log --oneline` and `git diff main...HEAD` to understand the FULL commit history for this branch from when it diverged from main
   - Analyze ALL changes that will be included in the PR (not just latest commit, but ALL commits!)
   - Draft a comprehensive PR summary

4. Create the pull request:
   - Create new branch if needed
   - Push to remote with `-u` flag if needed
   - Use `gh pr create` with proper formatting:
     ```
     gh pr create --title "descriptive title" --body "$(cat <<'EOF'
     ## Summary
     - Bullet point summary of changes
     - Focus on what and why, not how

     ## Test plan
     - [ ] Tested feature X
     - [ ] Verified no regressions
     - [ ] Checked browser compatibility

     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     EOF
     )"
     ```
   - Return the PR URL to the user

**Safety Rules:**
- NEVER create a PR if validation checks fail
- NEVER use `--force` unless explicitly requested
- Review ALL commits in the branch, not just the latest one
- Ensure PR description accurately reflects all changes
- Include a comprehensive test plan

**Use Case:** When your feature branch is complete and ready for code review.

**Arguments:** $ARGUMENTS (optional - can specify target branch, e.g., "main" or "develop". Defaults to main)
