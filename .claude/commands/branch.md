---
description: "Create and switch to a new git branch"
---

Create and switch to a new git branch with proper handling of uncommitted changes.

**Workflow:**

1. **Check current git status:**
   - Run `git status` to see if there are uncommitted changes
   - Check current branch name

2. **Handle uncommitted changes (if any):**
   - If uncommitted changes exist, inform the user about them
   - Ask the user what they want to do using AskUserQuestion tool:
     - Option 1: "Stash changes" - Stash changes with `git stash` before creating branch
     - Option 2: "Commit changes" - Stage and commit changes before creating branch (will prompt for commit message)
     - Option 3: "Proceed anyway" - Create branch with uncommitted changes (changes will carry over to new branch)
   - Handle the user's choice appropriately

3. **Get source branch:**
   - List available local branches: `git branch --list`
   - List available remote branches: `git branch -r --list`
   - Prompt the user: "Which branch should the new branch be created from? (default: current branch)"
   - Default to current branch if user just presses enter or provides empty response
   - Validate that the source branch exists (locally or remotely)
   - If source branch is remote-only, fetch it first or inform user they need to checkout the remote branch first

4. **Get branch name:**
   - Prompt the user: "What should the new branch be called?"
   - Wait for user response

5. **Validate branch name:**
   - Check if branch already exists locally: `git branch --list <branch-name>`
   - Check if branch exists on remote: `git branch -r --list origin/<branch-name>`
   - If branch exists, inform the user and ask if they want to:
     - Switch to existing branch instead
     - Use a different name
     - Stop the operation

6. **Warn if branching from main/master:**
   - If source branch is `main` or `master`, warn the user that they're creating a branch from main/master
   - This is usually fine, but good to make them aware

7. **Create and switch to new branch:**
   - If source branch is the current branch: Use `git checkout -b <branch-name>` or `git switch -c <branch-name>`
   - If source branch is different: First checkout the source branch (if not already on it), then use `git checkout -b <branch-name> <source-branch>` or `git switch -c <branch-name> <source-branch>`
   - If source branch is remote-only: Use `git checkout -b <branch-name> origin/<source-branch>` or `git switch -c <branch-name> origin/<source-branch>`

8. **Show confirmation:**
   - Run `git status` to show the new branch and current state
   - Confirm the branch was created successfully
   - If changes were stashed, remind the user they can restore with `git stash pop`

**Safety Rules:**
- NEVER use `--force` unless explicitly requested
- Check if branch already exists before creating
- Validate that source branch exists before attempting to branch from it
- Warn if attempting to create a branch from main/master
- Follow git best practices for branch naming (avoid spaces, use kebab-case or snake_case)
- If user chooses to commit changes, follow repository's commit message style

**Use Case:** When starting work on a new feature or task and need to create a new branch.

**Arguments:** None (always prompts for branch name)

