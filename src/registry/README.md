# Component Registry

This directory serves as the **source of truth** for all UI components in the design prototypes playground.

## Overview

The registry is a self-hosted component library inspired by [shadcn/ui](https://ui.shadcn.com/). All prototypes import components directly from this registry, making it easy to test how component changes affect multiple design contexts instantly.

## Structure

```
registry/
├── ui/              # UI components (buttons, dialogs, inputs, etc.)
├── lib/             # Utility functions (cn helper, etc.)
└── README.md        # This file
```

## Usage

### Importing Components

All prototypes should import components directly from the registry:

```typescript
// Import UI components
import { Button } from "@/registry/ui/button"
import { Dialog } from "@/registry/ui/dialog"
import { Input } from "@/registry/ui/input"

// Import utilities
import { cn } from "@/registry/lib/utils"
```

### Available Components

Currently available UI components:
- `accordion` - Collapsible content sections
- `alert` - Alert messages and notifications
- `avatar` - User avatars with fallback
- `badge` - Status badges and tags
- `button` - Interactive buttons with variants
- `card` - Container cards with header/footer
- `dialog` - Modal dialogs
- `input` - Form input fields
- `kbd` - Keyboard key display
- `label` - Form labels
- `popover` - Floating popover content
- `select` - Dropdown select menus
- `separator` - Visual dividers
- `sheet` - Side panel drawers
- `switch` - Toggle switches
- `table` - Data tables
- `tooltip` - Hover tooltips

## How It Works

### Shared Registry Model

Unlike the traditional shadcn approach (where components are copied into each project), this registry uses a **shared import model**:

1. **Registry = Source of Truth**: All components live here
2. **Prototypes Import**: Each prototype imports directly from `@/registry/ui/*`
3. **Instant Updates**: Changes to registry components affect all prototypes immediately
4. **Test Bed**: Perfect for testing design system changes across multiple contexts

### Benefits

- **Fast iteration**: Edit once, see changes everywhere
- **Consistency testing**: Validate design decisions at scale
- **Simple workflow**: No sync scripts or tooling needed
- **Design exploration**: Test "what if" scenarios across all prototypes

## Local Overrides (Advanced)

If a specific prototype needs a customized version of a component:

1. **Copy the component locally**:
   ```bash
   cp src/registry/ui/button.tsx src/prototypes/my-prototype/components/ui/button.tsx
   ```

2. **Update the import in that prototype**:
   ```typescript
   // Before
   import { Button } from "@/registry/ui/button"

   // After (local override)
   import { Button } from "./components/ui/button"
   ```

3. **Customize freely**: The local copy won't be affected by registry changes

4. **Promote back** (optional): If the customization should become the new standard, copy it back to the registry

## Development Workflow

### Testing Registry Changes

1. Edit a component in `src/registry/ui/[component].tsx`
2. Start the dev server: `pnpm dev`
3. Navigate between prototypes to see the impact
4. Iterate until satisfied

### Adding New Components

1. Add the component to `src/registry/ui/[component].tsx`
2. Ensure it imports utilities from `@/registry/lib/utils`
3. Use it in prototypes via `import { Component } from "@/registry/ui/component"`

### Using shadcn CLI

The `components.json` config points to this registry. To add official shadcn components:

```bash
pnpm dlx shadcn@latest add [component-name]
```

This will add components directly to the registry.

## Philosophy

This registry mirrors the concept of a design system in a real-world application:

- **Registry** = Your organization's design system package
- **Prototypes** = Different product areas consuming the design system
- **Testing** = See how design system changes ripple across products

The shared import model is perfect for a design playground where you want to see global impact, while still maintaining the flexibility to create local overrides when needed.

## Notes

- All registry components use Radix UI primitives
- Styling is done with Tailwind CSS v4
- Class utilities use `cn()` from `@/registry/lib/utils`
- Components follow shadcn/ui conventions and patterns
