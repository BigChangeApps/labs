# Prototype Visibility System

This project supports managing prototypes with different visibility levels for internal development and customer-facing deployments.

## Overview

Prototypes can be marked as either:
- **`public`**: Visible to customers
- **`internal`**: Only visible when `VITE_SHOW_INTERNAL` is not set to `"false"`

## How It Works

### Development (Default)
By default, all prototypes and features are visible:
```bash
pnpm dev
# Shows: All prototypes + Dark Mode Toggle + Brand Switcher + /tokens page
```

### Customer-Facing Build
To hide internal prototypes and features:
```bash
VITE_SHOW_INTERNAL=false pnpm build
# or create .env with:
# VITE_SHOW_INTERNAL=false
```

This will:
- Hide prototypes marked with `visibility: "internal"`
- Remove the Dark Mode Toggle
- Remove the Brand Switcher
- Remove the `/tokens` page
- Block direct URL access to internal prototypes (redirects to home)

## Creating New Prototypes

When using `/new-prototype`, you'll be prompted for visibility:
- **public**: Will be visible in customer deployments
- **internal**: Only visible in internal/development builds

## Deployment Strategy

### Single Codebase, Two Deployments

**Internal URL** (e.g., `labs-internal.yourcompany.com`):
```bash
# .env.internal
VITE_SHOW_INTERNAL=true
pnpm build
```

**Customer URL** (e.g., `labs.yourcompany.com`):
```bash
# .env.production
VITE_SHOW_INTERNAL=false
pnpm build
```

## Promoting Prototypes

To make an internal prototype public, simply update its visibility in [src/data/prototypes.ts](src/data/prototypes.ts):

```typescript
{
  id: "my-prototype",
  // ... other fields
  visibility: "internal"  // Change to "public"
}
```

## Implementation Details

- **Filtering**: [src/data/prototypes.ts](src/data/prototypes.ts) - `getVisiblePrototypes()` and `isPrototypeVisible()`
- **Route Guards**: [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) - Prevents direct URL access
- **App Configuration**: [src/app.tsx](src/app.tsx) - Conditionally renders internal features
- **Home Page**: [src/home.tsx](src/home.tsx) - Uses filtered prototype list
