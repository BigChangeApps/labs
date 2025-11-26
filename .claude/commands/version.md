---
description: "Create a new version of an existing prototype"
---

Create a new version of a prototype with git branch and directory structure.

**Step 1:** Ask the user: "Which prototype do you want to version?"
- Look in `src/prototypes/` for parent directories (e.g., "asset-attributes", "workflow-builder")
- These are the base prototype names
- List the available base prototype names
- Example: "asset-attributes"

**Step 2:** After receiving the prototype name, ask: "Which version do you want to branch from?"
- List existing versions found in `src/prototypes/{prototype-name}/v*` (e.g., "v1", "v2")
- Add option: "start-fresh" (creates empty structure)
- Default to the highest version number if the user just presses enter

**Step 3:** Ask: "What should the new version be called?"
- Suggest the next version number (if v2 exists, suggest v3)
- Format: v{number}
- Default to the suggested version if the user just presses enter

**Step 4:** Execute the following steps:

1. **Create git branch:**
   ```bash
   git checkout -b {prototype-name}/v{new-number}
   ```

2. **Copy or create directory:**
   - If branching from existing version:
     ```bash
     cp -r src/prototypes/{prototype-name}/v{source} src/prototypes/{prototype-name}/v{new}
     ```
   - If starting fresh, create basic structure:
     ```
     src/prototypes/{prototype-name}/v{new}/
     ├── App.tsx (basic template)
     ├── components/
     ├── lib/
     │   ├── store.ts
     │   └── mock-data.ts
     └── types/
         └── index.ts
     ```

3. **Update `src/data/prototypes.ts`:**
   - Add new prototype entry:
     ```typescript
     {
       id: "{prototype-name}-v{new}",
       title: "{Title} v{new}",
       description: "Description for the new version",
       thumbnail: "/thumbnails/{prototype-name}-v{new}.png",
       path: "/{prototype-name}/v{new}",
       createdAt: "{today's date in YYYY-MM-DD}",
       deviceType: "desktop",
       visibility: "internal",
     }
     ```

4. **Update `src/app.tsx`:**
   - Add import:
     ```typescript
     import {PascalCase}V{new}App from "@/prototypes/{prototype-name}/v{new}/App";
     ```
   - Add route:
     ```typescript
     <Route
       path="/{prototype-name}/v{new}/*"
       element={
         <ProtectedRoute prototypeId="{prototype-name}-v{new}">
           <{PascalCase}V{new}App />
         </ProtectedRoute>
       }
     />
     ```

5. **Stage changes:**
   ```bash
   git add src/prototypes/{prototype-name}/v{new}
   git add src/data/prototypes.ts
   git add src/app.tsx
   ```

**Step 5:** Inform the user with a summary:
```
✓ Created version: {prototype-name} v{new}
✓ Git branch: {prototype-name}/v{new}
✓ Directory: src/prototypes/{prototype-name}/v{new}/
✓ Route: http://localhost:5173/{prototype-name}/v{new}

Changes staged (not committed). You can now:
- Start editing your new version
- Run the dev server to preview
- Commit when ready with your changes
```

**Important notes:**
- Do NOT commit automatically - let the user make their first changes before committing
- The new version starts with `visibility: "internal"` so it's not visible to customers yet
- The user can change visibility to "public" when ready for customer testing
