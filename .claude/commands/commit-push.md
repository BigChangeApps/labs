---
description: "Commit and push with full validation (tsc + lint + build)"
---

Commit and push changes with comprehensive validation checks for production-ready commits.

**Validation Process:**

1. Run complete validation suite:
   - `tsc --noEmit` - Type checking (catches type errors)
   - `pnpm run lint` - Linting (code quality checks)
   - `pnpm run build` - Full build (ensures everything compiles and bundles correctly)

2. If any check fails, STOP immediately and report errors to the user

3. If all checks pass, proceed with git workflow:
   - Run `git status` to see current changes
   - Run `git diff --staged` to review what will be committed
   - Run `git log -3 --oneline` to understand commit message style
   - Check current branch name - warn if on main/master
   - Analyze staged changes and draft an appropriate commit message
   - Create commit with proper formatting including:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```
   - Check if branch has upstream tracking
   - **Before pushing, check if branch is behind remote:**
     - Run `git fetch` to get latest remote info
     - Run `git status` to check if branch is behind
     - If behind, inform the user and ask if they want to pull first using AskUserQuestion tool
     - If user confirms pull, run `git pull --rebase` (rebase to keep history clean)
     - If pull succeeds, proceed with push
     - If pull fails (e.g., conflicts), stop and report the issue
     - If user declines pull, stop and remind them to pull manually
   - Push to remote (use `-u origin <branch>` if no upstream exists)
   - Show final git status

**Safety Rules:**
- NEVER use `--force` or `--no-verify` unless explicitly requested
- NEVER commit files with secrets (.env, credentials.json, etc.)
- WARN user if attempting to push to main/master branch
- Follow repository's commit message style

**Use Case:** Before creating PRs, merging to main, or when you want maximum confidence that your changes are production-ready.

**Arguments:** $ARGUMENTS (optional - custom commit message. If not provided, one will be generated from the staged changes)
