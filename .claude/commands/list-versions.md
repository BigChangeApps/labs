---
description: "List all versions of a prototype"
---

Show all versions of a prototype and their git branches.

**Step 1:** Ask the user: "Which prototype do you want to see versions for?"
- Look in `src/prototypes/` for parent directories (e.g., "asset-attributes", "workflow-builder")
- These are the base prototype names
- List the available base prototype names
- Add option: "all" (shows all versioned prototypes)

**Step 2:** After receiving the prototype name (or "all"), execute:

1. **Find all versions:**
   - List subdirectories within `src/prototypes/{prototype-name}/` matching pattern `v*`
   - Extract version numbers (e.g., from "v1", "v2", "v3")

2. **Check git branches:**
   ```bash
   git branch --list "{prototype-name}/v*"
   git branch --show-current
   ```

3. **Read prototype metadata:**
   - Parse `src/data/prototypes.ts` to get title, description, and visibility for each version

**Step 3:** Display the information in a clear format:

```
Prototype: {prototype-name}

Versions:
  ✓ v1 - {Title v1}
    Path: /{prototype-name}/v1
    URL: http://localhost:5173/{prototype-name}/v1
    Visibility: {public/internal}

  ✓ v2 - {Title v2}
    Path: /{prototype-name}/v2
    URL: http://localhost:5173/{prototype-name}/v2
    Visibility: {public/internal}

  ✓ v3 - {Title v3} (current branch)
    Path: /{prototype-name}/v3
    URL: http://localhost:5173/{prototype-name}/v3
    Visibility: {public/internal}

Git branches:
  - {prototype-name}/v1
  - {prototype-name}/v2
  * {prototype-name}/v3 (current)

Total: {N} versions
```

**If "all" was selected:**
Show the same format for each prototype group, separated by blank lines.

**Additional info to include:**
- Mark the current git branch with an asterisk (*)
- Indicate which version corresponds to the current directory (if browsing from within a prototype)
- Show visibility status (public = accessible to customers, internal = dev only)
- Include the local dev URLs for easy access

**If no versioned prototypes are found:**
```
No versioned prototypes found.

To create a versioned prototype, use:
  /new-version

Or manually create a prototype directory with the pattern:
  src/prototypes/{name}/v{number}/
```
