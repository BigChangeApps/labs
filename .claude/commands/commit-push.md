---
description: "Commit and push with full validation (tsc + lint + build)"
---

Commit and push changes with comprehensive validation checks for production-ready commits.

**Validation Process:**

1. **Pre-flight: Clean pnpm-lock.yaml link overrides**
   - Check if `pnpm-lock.yaml` has unstaged or staged changes
   - If modified, check if it contains `link:` paths (from `pnpm link` local development)
   - If `link:` paths are found, automatically run `git restore pnpm-lock.yaml` to discard those changes
   - Inform the user: "ℹ️ Restored pnpm-lock.yaml - local `pnpm link` overrides should not be committed"

2. Run complete validation suite:
   - `tsc --noEmit` - Type checking (catches type errors)
   - `pnpm run lint` - Linting (code quality checks)
   - `pnpm run build` - Full build (ensures everything compiles and bundles correctly)

3. If any check fails, STOP immediately and report errors to the user

4. If all checks pass, proceed with git workflow:
   - Run `git status` to see current changes
   - Run `git diff --staged` to review what will be committed
   - Run `git log -3 --oneline` to understand commit message style
   - Check current branch name - **If on main/master branch:**
     - **STOP and ask for confirmation:** "⚠️ WARNING: You are on the 'main' (or 'master') branch. Committing directly to main/master bypasses code review. Are you sure you want to proceed? (yes/no)"
     - **Wait for user response** before proceeding
     - If user says "no" or declines, STOP and suggest creating a feature branch instead
     - If user confirms "yes", proceed with commit
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
- **REQUIRE explicit confirmation before committing to main/master branch** - ask user if they're sure they want to proceed
- Follow repository's commit message style
- **NEVER commit pnpm-lock.yaml with `link:` paths** - these are local development overrides that break CI/CD

**Use Case:** Before creating PRs, merging to main, or when you want maximum confidence that your changes are production-ready.

**Arguments:** $ARGUMENTS (optional - custom commit message. If not provided, one will be generated from the staged changes)
