# Highway Custom Registry Setup - Complete Guide

## Overview
This project uses a custom shadcn component registry hosted locally at `http://localhost:3001` that serves Highway Design System components.

## ✅ Working Configuration

### components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "highway",
  "rsc": false,
  "tsx": true,
  "aliases": {
    "components": "@/registry",
    "utils": "@/registry/lib/utils",
    "ui": "@/registry/ui",
    "lib": "@/registry/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@highway": "http://localhost:3001/r/{name}.json"
  }
}
```

### Key Configuration Points

1. **Style**: Set to `"highway"` to match the registry path structure
2. **Aliases**: Use `@/` prefix to match tsconfig path aliases
3. **Registry URL**: Points to local server with `{name}` placeholder
4. **Registry Key**: Must start with `@` (e.g., `@highway`)

### tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### vite.config.ts
```typescript
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
})
```

## Server Response Format

### Individual Component Endpoint
**URL Pattern**: `http://localhost:3001/r/{component-name}.json`

**Example**: `http://localhost:3001/r/button.json`

**Required Response Structure**:
```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "button",
  "type": "registry:component",
  "title": "Button",
  "description": "Displays a button or a component that looks like a button.",
  "dependencies": ["@radix-ui/react-slot"],
  "registryDependencies": [],
  "files": [
    {
      "path": "ui/button.tsx",
      "type": "registry:ui",
      "content": "import * as React from \"react\"...",
      "target": ""
    }
  ]
}
```

### Critical Requirements

1. **File Path**: Must be relative to style directory
   - ✅ Correct: `"path": "ui/button.tsx"`
   - ❌ Wrong: `"path": "registry/highway/ui/button.tsx"`

2. **File Type**: Must be `"registry:ui"` for UI components
   - ✅ Correct: `"type": "registry:ui"`
   - ❌ Wrong: `"type": "registry:component"`

3. **Target Field**: Must be present (empty string for standard install)
   - ✅ Correct: `"target": ""`
   - ❌ Wrong: Missing target field

4. **Content Field**: Must contain actual file contents as string
   - ✅ Required for all files

## Usage

### Adding Components

```bash
# Add a single component from @highway registry
npx shadcn@latest add @highway/button

# Add multiple components
npx shadcn@latest add @highway/button @highway/dialog @highway/card

# Overwrite existing components
npx shadcn@latest add @highway/button --overwrite
```

### How It Works

1. Developer runs: `npx shadcn@latest add @highway/button`
2. CLI replaces `{name}` with `button`: `http://localhost:3001/r/button.json`
3. Server returns component metadata with file contents
4. CLI reads `"path": "ui/button.tsx"` from response
5. CLI looks up `ui` alias: `"@/registry/ui"`
6. CLI resolves `@` using tsconfig: `./src`
7. Component installed to: `src/registry/ui/button.tsx` ✅

## Pre-commit Hook

A husky pre-commit hook validates:
- Registry configuration remains intact
- Developers confirm using `@highway` registry for new components
- Type checking passes (`npx tsc --noEmit`)
- Linting passes (`pnpm lint`)

Located at: `.husky/pre-commit`

## Documentation

Team documentation in `CLAUDE.md` includes:
- Instructions to always use `@highway` registry
- Example commands
- Why the custom registry is important

## Troubleshooting

### Components Install to Wrong Location

**Symptom**: Files created at `@/registry/highway/ui/button.tsx` (literal @ directory)

**Solution**: Verify:
1. Server returns paths without `registry/{style}/` prefix
2. File type is `"registry:ui"` not `"registry:component"`
3. Target field is present: `"target": ""`

### Imports Use Wrong Paths

**Symptom**: Components import from `src/lib/utils` instead of `@/registry/lib/utils`

**Solution**: Ensure aliases in `components.json` use `@/` prefix:
```json
"aliases": {
  "utils": "@/registry/lib/utils"  // ✅ Correct
}
```

Not:
```json
"aliases": {
  "utils": "src/registry/lib/utils"  // ❌ Wrong
}
```

### Invalid Configuration Error

**Symptom**: `Invalid configuration found in components.json`

**Solution**: Check that:
1. Registry key starts with `@`: `"@highway"` not `"highway"`
2. URL includes `{name}` placeholder
3. tsconfig.json has baseUrl and paths configured

## Testing

Verify setup works:

```bash
# Test server endpoint
curl http://localhost:3001/r/button.json

# Should return JSON with:
# - "path": "ui/button.tsx" (relative path)
# - "type": "registry:ui" (correct type)
# - "target": "" (empty string)
# - "content": "..." (actual file contents)

# Test adding component
npx shadcn@latest add @highway/calendar

# Should create file at:
# src/registry/ui/calendar.tsx ✅
```

## Summary

**What Works**:
- ✅ Custom `@highway` registry configured
- ✅ Local server at `http://localhost:3001`
- ✅ Components install to correct location: `src/registry/ui/`
- ✅ Imports use correct aliases: `@/registry/lib/utils`
- ✅ Pre-commit validation ensures compliance
- ✅ Documentation guides developers

**Key Learnings**:
1. The `style` property must match your registry structure
2. File paths should be relative to the style directory
3. File type must be `"registry:ui"` for UI components
4. Target field must be present (even if empty)
5. Both tsconfig and vite.config must define `@` alias
6. Registry keys must start with `@`
