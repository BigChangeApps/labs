# Prototype Version Management

This document explains how to manage multiple versions of prototypes in the Labs repository.

## Philosophy

**Version Isolation**: Each version of a prototype is completely independent with zero shared code between versions. This approach prioritizes:

- **Fast iteration** - No decisions about what should be shared vs version-specific
- **Clean handover** - Devs receive a self-contained directory ready to implement
- **No breaking changes** - Deploying v2 never affects v1
- **AI clarity** - No confusion with duplicate filenames across versions

## Directory Structure

```
src/prototypes/
├── asset-attributes/
│   ├── v1/                       # Version 1 - completely standalone
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   │
│   ├── v2/                       # Version 2 - completely standalone
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   │
│   └── v3/                       # Version 3 - completely standalone
│       └── ...
│
└── other-prototype/
    ├── v1/
    └── v2/
```

## Creating a New Version

### Using the `/new-version` command (Recommended)

```bash
/new-version
```

The command will:
1. Ask which prototype you want to version
2. Ask which version to branch from (or start fresh)
3. Suggest the next version number
4. Create git branch `{prototype-name}/v{number}`
5. Copy the source version or create fresh structure
6. Update routing and prototype registration
7. Stage the changes (doesn't commit automatically)

### Manual Process

If you prefer to do it manually:

1. **Create git branch:**
   ```bash
   git checkout -b asset-attributes/v3
   ```

2. **Copy existing version:**
   ```bash
   cp -r src/prototypes/asset-attributes/v2 src/prototypes/asset-attributes/v3
   ```

3. **Update `src/data/prototypes.ts`:**
   ```typescript
   {
     id: "asset-attributes-v3",
     title: "Asset Attributes Management v3",
     description: "Description of what's new in v3",
     thumbnail: "/thumbnails/asset-attributes-v3.png",
     path: "/asset-attributes/v3",
     createdAt: "2025-01-17",
     deviceType: "desktop",
     visibility: "internal", // Start as internal, change to public when ready
   }
   ```

4. **Update `src/app.tsx`:**
   ```typescript
   import AssetAttributesV3App from "@/prototypes/asset-attributes/v3/App";

   // Add route:
   <Route
     path="/asset-attributes/v3/*"
     element={
       <ProtectedRoute prototypeId="asset-attributes-v3">
         <AssetAttributesV3App />
       </ProtectedRoute>
     }
   />
   ```

5. **Stage changes:**
   ```bash
   git add src/prototypes/asset-attributes/v3
   git add src/data/prototypes.ts
   git add src/app.tsx
   ```

## Git Workflow

### Branch Structure

```
main (has all merged versions)
├── asset-attributes/v1 (work on v1 improvements)
├── asset-attributes/v2 (work on v2 improvements)
└── asset-attributes/v3 (experiments)
```

### Working on a Version

```bash
# Switch to version branch
git checkout asset-attributes/v3

# Make changes to v3/...
# Only edit files in src/prototypes/asset-attributes/v3/

# Commit your changes
git add .
git commit -m "Add table view to v3"

# Merge to main when ready to deploy
git checkout main
git merge asset-attributes/v3
```

### Important Rules

- **Never edit v1 when working on v2** - Each version is isolated
- **Always work on the version branch** - Keeps changes organized
- **Merge to main when ready to deploy** - Makes the version accessible
- **v1 stays untouched when v2 is deployed** - No breaking changes

## Viewing Versions

### Using the `/list-versions` command

```bash
/list-versions
```

Shows:
- All versions of a prototype
- Their URLs and paths
- Git branches
- Current branch indicator
- Visibility status (public/internal)

### Dev Bar (Internal Only)

When running locally or with `VITE_SHOW_INTERNAL=true`, a dev bar appears in the bottom-right corner:

- Shows quick links to switch between versions
- Only appears when viewing a versioned prototype
- Never visible to customers in production

## Customer Testing

### Simple URL Access

Each version has its own URL:

```
Customer A (testing v1):
https://labs.bigchange.com/asset-attributes/v1

Customer B (testing v2):
https://labs.bigchange.com/asset-attributes/v2
```

### Visibility Control

Control who can access versions via `src/data/prototypes.ts`:

```typescript
{
  id: "asset-attributes-v3",
  visibility: "internal", // Only visible with VITE_SHOW_INTERNAL=true
}

{
  id: "asset-attributes-v2",
  visibility: "public", // Accessible to anyone with the link
}
```

### Non-Breaking Deployments

```
Before deploying v2:
✓ /asset-attributes/v1 works

After deploying v2:
✓ /asset-attributes/v1 still works (unchanged)
✓ /asset-attributes/v2 now works (new)
```

**Customer links never break** because each version is independent.

## Handover to Developers

When a version is approved for development:

1. **The version directory is self-contained:**
   ```
   src/prototypes/asset-attributes/v2/
   ```

2. **No external dependencies** (no shared components to track down)

3. **Create handover package:**
   ```bash
   # Copy the approved version
   cp -r src/prototypes/asset-attributes/v2 handover-package/
   ```

4. **Add implementation guide:**
   - Document any mock data that needs real API integration
   - Note any prototype-specific shortcuts that need production implementation
   - List required backend endpoints

5. **Developers receive:**
   - Clean, self-contained code
   - No feature flags to decode
   - Clear component boundaries
   - Working prototype they can test

## Best Practices

### When to Create a New Version

- **Incremental changes** → Copy previous version (e.g., v2 from v1)
- **Radical experiments** → Copy and heavily modify, or start fresh
- **Testing assumptions** → Create new version to preserve working version

### Code Duplication is OK

- Prototypes are temporary demonstrations, not production code
- Each version has a finite lifetime
- Clean boundaries > DRY principle
- Devs will refactor properly during implementation

### Keep Versions Clean

- Remove debug code and console.logs before marking as public
- Update descriptions to clearly explain what's different
- Add thumbnail images to distinguish versions
- Document major differences in commit messages

## Common Commands

```bash
# Create a new version
/new-version

# View all versions
/list-versions

# Switch to version branch
git checkout asset-attributes/v3

# View current branch
git branch --show-current

# List all version branches
git branch --list "asset-attributes/*"

# Merge version to main
git checkout main
git merge asset-attributes/v3
```

## Troubleshooting

### "Cannot find module" errors after renaming

Run the TypeScript compiler to check for import errors:
```bash
npx tsc --noEmit
```

### Version not showing in prototype picker

Check:
1. Is it registered in `src/data/prototypes.ts`?
2. Is visibility set correctly?
3. Is VITE_SHOW_INTERNAL set if visibility is "internal"?

### Dev bar not appearing

The dev bar only shows when:
- `import.meta.env.DEV === true` (dev mode), OR
- `import.meta.env.VITE_SHOW_INTERNAL === "true"`

And only when viewing a versioned prototype.

### Git merge conflicts

If you get conflicts when merging a version branch to main:
1. The conflict is likely in `src/app.tsx` or `src/data/prototypes.ts`
2. Resolve by keeping both versions' entries (they should be additive)
3. Never remove another version's code when merging

## Examples

### Example: Testing Two Approaches with Customers

**Scenario**: You want to test a card-based view (v1) vs a table view (v2) with different customers.

```bash
# Create v2 from v1
/new-version
# Choose: asset-attributes, v1, v3

# Implement table view in v2
# Edit src/prototypes/asset-attributes/v2/...

# Commit and merge to main
git add .
git commit -m "Add table view in v2"
git checkout main
git merge asset-attributes/v2

# Deploy to staging/production
# Share URLs:
# - Customer A: https://labs.bigchange.com/asset-attributes/v1
# - Customer B: https://labs.bigchange.com/asset-attributes/v2
```

Both versions are now live, neither affects the other, and you can gather feedback on both approaches.

### Example: Radical v3 Experiment

**Scenario**: v2 is in customer testing. You want to try a completely different approach for v3.

```bash
# Create v3 branch
/new-version
# Choose: asset-attributes, start-fresh, v3

# v3 is now internal-only
# Experiment freely - v2 is safe

# If v3 works out:
git checkout main
git merge asset-attributes/v3
# Change visibility to "public" in prototypes.ts

# If v3 doesn't work:
git branch -D asset-attributes/v3  # Delete the branch
# v2 is untouched, no harm done
```

## Summary

- **One version = One directory** - No shared code
- **Git branches per version** - Safe experimentation
- **Deploy all versions** - Customer links never break
- **Dev bar for you** - Quick switching during development
- **Clean handover** - Just give devs the directory
- **Use `/new-version`** - Automates the whole process
