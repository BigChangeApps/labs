---
description: "Create and switch to a new git branch"
---

Create and switch to a new git branch with proper handling of uncommitted changes.

**Important:** Ask questions sequentially, one at a time. Wait for the user's response before proceeding to the next question. Do not ask multiple questions at once.

**Step 1:** Check current git status
- Run `git status` to see if there are uncommitted changes
- Get current branch name: `git branch --show-current`
- List available local branches: `git branch --list`
- List available remote branches: `git branch -r --list`

**Step 2:** Handle uncommitted changes (if any)
- If uncommitted changes exist, inform the user about them
- **Ask the user (one question at a time):** "You have uncommitted changes. What would you like to do?"
  - Option 1: "Stash changes" - Stash changes with `git stash` before creating branch (you can restore later with `git stash pop`)
  - Option 2: "Commit changes" - Stage and commit changes before creating branch (will prompt for commit message)
  - Option 3: "Proceed anyway" - Keep changes and carry them to the new branch (if branching from different branch, changes will be automatically stashed/restored)
- **Wait for user's response** before proceeding
- Handle the user's choice appropriately (stash, commit, or proceed)

**Step 3:** After handling uncommitted changes (or if there were none), ask about source branch
- **Ask the user (one question at a time):** "You are currently on branch '<current-branch>'. Which branch should the new branch be created from?"
  - List the available local branches from the earlier `git branch --list` output
  - Show the current branch name clearly
  - **IMPORTANT:** Only show branches that actually exist - do NOT hardcode 'master' or 'main' if they don't exist
  - Allow user to specify any branch name (local or remote)
  - **IMPORTANT:** Do NOT default to current branch - always ask explicitly to avoid confusion
  - If user doesn't specify, ask again: "Please specify which branch to branch from (e.g., 'main' or '<current-branch>')"
- **Wait for user's response** before proceeding
- Validate that the source branch exists (locally or remotely)
- If source branch is remote-only, fetch it first or inform user they need to checkout the remote branch first
- If source branch is different from current branch and there are uncommitted changes, handle appropriately (may need to stash/commit first)

**Step 4:** After receiving the source branch, ask for branch name
- Analyze existing branch naming patterns from the branch list:
  - Look for common prefixes (e.g., `feature/`, `fix/`, `asset-attributes/`, etc.)
  - Identify naming conventions used in the repository
- **Ask the user (one question at a time):** "What should the new branch be called?"
  - Suggest naming patterns based on existing branches (e.g., "Based on your existing branches, common patterns are: 'feature/{name}', 'asset-attributes/{name}', etc.")
  - Provide examples: "Examples: 'feature/my-feature', 'fix/bug-description', 'asset-attributes/improvement'"
  - Remind about best practices: "Use kebab-case, avoid spaces, be descriptive"
- **Wait for user's response** before proceeding
- Validate branch name:
  - Check if branch already exists locally: `git branch --list <branch-name>`
  - Check if branch exists on remote: `git branch -r --list origin/<branch-name>`
  - If branch exists, inform the user and ask if they want to:
    - Switch to existing branch instead
    - Use a different name
    - Stop the operation

**Step 5:** Warn if branching from main/master
- If source branch is `main` or `master`, warn the user that they're creating a branch from main/master
- This is usually fine, but good to make them aware

**Step 6:** Create and switch to new branch
- If source branch is the current branch: Use `git checkout -b <branch-name>` or `git switch -c <branch-name>`
- If source branch is different from current branch:
  - **If there are uncommitted changes and user chose "Proceed anyway" in step 2:**
    - Automatically stash the changes: `git stash push -m "Temporary stash for branch creation"`
    - Create the branch from source: `git branch <branch-name> <source-branch>` (creates without switching)
    - Switch to the new branch: `git checkout <branch-name>` or `git switch <branch-name>`
    - Restore the stashed changes: `git stash pop`
    - If there are conflicts during stash pop, resolve them (usually means keeping the stashed version)
    - Inform the user that changes were temporarily stashed and restored
  - **If changes were already stashed or committed in step 2:**
    - Create the branch from source: `git branch <branch-name> <source-branch>`
    - Switch to the new branch: `git checkout <branch-name>` or `git switch <branch-name>`
  - **If there are no uncommitted changes:**
    - Use `git checkout -b <branch-name> <source-branch>` or `git switch -c <branch-name> <source-branch>`
- If source branch is remote-only: Use `git checkout -b <branch-name> origin/<source-branch>` or `git switch -c <branch-name> origin/<source-branch>`

**Step 7:** Show confirmation
- Run `git status` to show the new branch and current state
- Confirm the branch was created successfully
- If changes were automatically stashed and restored (when branching from different branch), confirm they were successfully restored
- If changes were manually stashed in step 2, remind the user they can restore with `git stash pop`

**Safety Rules:**
- NEVER use `--force` unless explicitly requested
- Check if branch already exists before creating
- Validate that source branch exists before attempting to branch from it
- Warn if attempting to create a branch from main/master
- Follow git best practices for branch naming (avoid spaces, use kebab-case or snake_case)
- If user chooses to commit changes, follow repository's commit message style

**Use Case:** When starting work on a new feature or task and need to create a new branch.

**Arguments:** None (always prompts for branch name)

