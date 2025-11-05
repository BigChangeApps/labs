---
description: "Quick commit and push with fast validation (tsc + lint)"
---

Commit and push changes with quick validation checks for rapid development iterations.

**Validation Process:**

1. Run fast validation checks:
   - `tsc --noEmit` - Type checking (catches type errors)
   - `npm run lint` - Linting (code quality checks)

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
   - Push to remote (use `-u origin <branch>` if no upstream exists)
   - Show final git status

**Safety Rules:**
- NEVER use `--force` or `--no-verify` unless explicitly requested
- NEVER commit files with secrets (.env, credentials.json, etc.)
- WARN user if attempting to push to main/master branch
- Follow repository's commit message style

**Use Case:** Quick iterations during feature development when you need fast feedback.

**Arguments:** $ARGUMENTS (optional - custom commit message. If not provided, one will be generated from the staged changes)
