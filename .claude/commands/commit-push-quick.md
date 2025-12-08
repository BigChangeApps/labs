---
description: "Quick commit and push with fast validation (tsc + lint)"
---

Commit and push changes with quick validation checks for rapid development iterations.

**Validation Process:**

1. **Pre-flight: Clean pnpm-lock.yaml link overrides**
   - Check if `pnpm-lock.yaml` has unstaged or staged changes
   - If modified, check if it contains `link:` paths (from `pnpm link` local development)
   - If `link:` paths are found, automatically run `git restore pnpm-lock.yaml` to discard those changes
   - Inform the user: "ℹ️ Restored pnpm-lock.yaml - local `pnpm link` overrides should not be committed"

2. Run fast validation checks:
   - `tsc --noEmit` - Type checking (catches type errors)
   - `pnpm run lint` - Linting (code quality checks)

3. If any check fails, STOP immediately and report errors to the user

4. If all checks pass, proceed with git workflow:
   - Run `git status` to see current changes
   - Run `git diff --staged` to review what will be committed
   - Run `git log -3 --oneline` to understand commit message style
   - Check current branch name - warn if on main/master
   - Analyze staged changes and draft an appropriate commit message
   - Create commit with proper formatting including:
     ```
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
- **NEVER commit pnpm-lock.yaml with `link:` paths** - these are local development overrides that break CI/CD

**Use Case:** Quick iterations during feature development when you need fast feedback.

**Arguments:** $ARGUMENTS (optional - custom commit message. If not provided, one will be generated from the staged changes)
