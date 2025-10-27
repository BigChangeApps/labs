# Design System Documentation

## Executive Summary (TL;DR)

This is a **multi-brand design system** that lets you switch between BigChange and SimPro brands in real-time, with full light/dark mode support. Here's how it works:

**How Colors Work**: Three layers stack together:
1. **Brand Primitives** (`styles/primitives/`) - Raw OKLCH color scales per brand (blue for BigChange, yellow for SimPro)
2. **Semantic Tokens** (`styles/tokens.css`) - Purpose-based names like `--hw-interactive`, `--hw-text`, `--hw-border` that point to primitives
3. **Tailwind Utilities** - Use classes like `bg-hw-interactive` or `text-hw-text` in components

**How Components Work**:
- All UI components live in `src/registry/ui/` as a **single source of truth**
- Import from registry: `import { Button } from "@/registry/ui/button"`
- Edit once, updates everywhere - no copying files between prototypes
- 17 components built on Radix UI primitives with CVA variants

**How Brands Switch**:
- `BrandSwitcher` component sets `data-brand="simpro"` on `<html>`
- CSS selectors like `[data-brand="simpro"]:not(.dark)` activate
- All tokens cascade automatically - no JavaScript needed
- Persists to localStorage

**How Dark Mode Works**:
- Add `.dark` class to `<html>` element
- CSS selectors like `[data-brand="bigchange"].dark` activate
- Tokens remap to lighter brand colors and inverted backgrounds
- Pure CSS - no runtime calculations

**Quick Start**:
- **Add a component**: Edit directly in `src/registry/ui/`
- **Use a token**: Apply Tailwind class like `bg-hw-surface` or `text-hw-text`
- **Add a token**: Define in `styles/tokens.css` with light/dark variants, map in `global.css` `@theme`
- **Test tokens**: Visit `/tokens` route, use BrandSwitcher to preview

**Tech Stack**: Vite + React + TypeScript + Tailwind v4 + OKLCH colors + Radix UI

---

## Overview

This design system implements a modern, multi-brand theming architecture using CSS custom properties, OKLCH color space, and a registry-based component library. The system supports multiple brands (BigChange, SimPro) with light and dark modes, providing a scalable foundation for rapid prototyping and consistent UI development.

### Key Features

- **Registry-Style Component Library** - Shared component source of truth inspired by shadcn/ui
- **Three-Layer Token Architecture** - Brand primitives → Semantic tokens → Tailwind utilities
- **Multi-Brand Support** - Runtime brand switching via data attributes
- **OKLCH Color Space** - Perceptually uniform colors for better accessibility
- **CSS-Based Theming** - No runtime JavaScript for color calculations
- **Tailwind v4 Integration** - Direct token-to-utility mapping

---

## Registry-Style UI Library

### Architecture

The codebase implements a **shared registry model** where UI components serve as a single source of truth, rather than being copied into each project.

**Location**: [`src/registry/`](src/registry/)

#### Benefits

- **Fast Iteration** - Edit once, updates everywhere
- **Consistency Testing** - All prototypes use identical components
- **No Sync Scripts** - Direct imports eliminate sync complexity
- **Perfect for Design Exploration** - Rapid testing across multiple contexts

#### Component Structure

All UI components live in [`src/registry/ui/`](src/registry/ui/):

- `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`
- `accordion.tsx`, `avatar.tsx`, `badge.tsx`, `alert.tsx`, `label.tsx`
- `popover.tsx`, `separator.tsx`, `sheet.tsx`, `switch.tsx`, `table.tsx`
- `tooltip.tsx`, `kbd.tsx`

#### Import Pattern

Prototypes import directly from the registry:

```typescript
import { Button } from "@/registry/ui/button"
import { Card } from "@/registry/ui/card"
```

#### Component Pattern

Components use **Class Variance Authority (CVA)** for variant management:

```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-hw-interactive text-hw-interactive-text",
        destructive: "bg-hw-destructive text-hw-destructive-text",
        outline: "border border-hw-border bg-hw-background",
        // ...
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    }
  }
)
```

**Key Libraries**:
- `class-variance-authority` - Variant system
- `clsx` + `tailwind-merge` - Class name composition
- `@radix-ui/*` - Accessible primitives

**Documentation**: See [`src/registry/README.md`](src/registry/README.md) for complete details.

---

## Token System

### Three-Layer Architecture

The design system uses a cascading token architecture that separates brand identity from semantic meaning:

```
Brand Primitives (OKLCH colors)
        ↓
Semantic Tokens (hw- namespace)
        ↓
Tailwind Utilities (bg-*, text-*, border-*)
```

### Layer 1: Brand Primitives

**Files**:
- [`styles/primitives/bigchange.css`](styles/primitives/bigchange.css) - BigChange brand colors
- [`styles/primitives/simpro.css`](styles/primitives/simpro.css) - SimPro brand colors

Each brand defines raw color scales using **OKLCH color space**:

```css
/* BigChange Blue */
--brand-50: oklch(0.97 0.04 265);   /* Lightest */
--brand-100: oklch(0.94 0.08 265);
--brand-200: oklch(0.88 0.12 265);
--brand-300: oklch(0.80 0.16 265);
--brand-400: oklch(0.70 0.22 265);
--brand-500: oklch(0.58 0.27 265);  /* Main brand blue #086DFF */
--brand-600: oklch(0.50 0.23 265);
--brand-700: oklch(0.42 0.19 265);
--brand-800: oklch(0.32 0.14 265);
--brand-900: oklch(0.23 0.10 265);
--brand-950: oklch(0.18 0.09 265);  /* Darkest */
```

**Color Scales Per Brand**:
- **Brand Scale** - Primary brand color (10 shades: 50-950)
- **Gray Scale** - Neutral grays (10 shades: 50-950)
- **Status Colors** - Red, Orange, Green, Blue, Slate (10 shades each)

**Why OKLCH?**
- Perceptually uniform - Equal lightness changes appear equal to the eye
- Better for accessibility - Predictable contrast ratios
- Wide color gamut - More vibrant colors than sRGB
- Hue consistency - Brightness changes don't shift hue

### Layer 2: Semantic Tokens

**File**: [`styles/tokens.css`](styles/tokens.css)

Semantic tokens map brand primitives to purpose-based names using the **`hw-` (Highway) namespace**:

#### Token Categories

**Typography**:
```css
--hw-text              /* Primary text color */
--hw-text-secondary    /* Secondary/muted text */
--hw-text-tertiary     /* Tertiary/subtle text */
```

**Surfaces**:
```css
--hw-background        /* Page background */
--hw-surface           /* Card/panel background */
--hw-surface-hover     /* Surface hover state */
--hw-surface-subtle    /* Subtle surface variant */
```

**Interactive Elements**:
```css
--hw-interactive            /* Primary interactive color */
--hw-interactive-hover      /* Interactive hover state */
--hw-interactive-text       /* Text on interactive */
--hw-interactive-secondary  /* Secondary interactive */
```

**Status Colors**:
```css
--hw-critical      /* Error/danger states */
--hw-warning       /* Warning states */
--hw-success       /* Success states */
--hw-informative   /* Info states */
--hw-inactive      /* Disabled/inactive */
```

**Destructive Actions**:
```css
--hw-destructive        /* Destructive action color */
--hw-destructive-hover  /* Destructive hover */
--hw-destructive-text   /* Text on destructive */
```

**Utility**:
```css
--hw-border    /* Border color */
--hw-focus     /* Focus ring color */
--hw-disabled  /* Disabled state color */
--hw-overlay   /* Modal overlay background */
```

#### Light/Dark Mode Mapping

Semantic tokens automatically adapt based on mode:

**Light Mode**:
```css
[data-brand="bigchange"]:not(.dark) {
  --hw-text: oklch(0.19 0 0);           /* Dark gray */
  --hw-background: oklch(1 0 0);        /* White */
  --hw-interactive: var(--brand-600);   /* Brand 600 */
}
```

**Dark Mode**:
```css
[data-brand="bigchange"].dark {
  --hw-text: var(--gray-50);            /* Light gray */
  --hw-background: var(--gray-950);     /* Near black */
  --hw-interactive: var(--brand-500);   /* Brand 500 (lighter) */
}
```

### Layer 3: Tailwind Integration

**File**: [`global.css`](global.css)

Semantic tokens map to Tailwind utilities via the `@theme` directive:

```css
@theme {
  --color-hw-text: var(--hw-text);
  --color-hw-background: var(--hw-background);
  --color-hw-interactive: var(--hw-interactive);
  --color-hw-border: var(--hw-border);
  /* ... */
}
```

**Usage in Components**:

```tsx
<button className="bg-hw-interactive text-hw-interactive-text hover:bg-hw-interactive-hover">
  Click me
</button>
```

### Token Reference Page

**File**: [`src/tokens.tsx`](src/tokens.tsx)

Interactive showcase displaying all token categories with:
- Visual color swatches
- CSS variable names
- Tailwind class names
- Computed color values
- Copy-to-clipboard functionality

Access at: `/tokens` route

---

## Brand System

### Multi-Brand Architecture

The system supports multiple brands using **data-attribute based CSS selectors**. Brand switching happens at runtime without recompiling CSS.

**Supported Brands**:
- **BigChange** - Blue brand color (default)
- **SimPro** - Dark yellow/amber brand color

### Brand Switcher Component

**File**: [`src/components/BrandSwitcher.tsx`](src/components/BrandSwitcher.tsx)

React component that manages brand selection:

```typescript
const BrandSwitcher = () => {
  const [brand, setBrand] = useState<"bigchange" | "simpro">("bigchange")

  const handleBrandChange = (newBrand) => {
    setBrand(newBrand)
    localStorage.setItem("selectedBrand", newBrand)
    document.documentElement.setAttribute("data-brand", newBrand)
  }

  // ...
}
```

**Features**:
- Dropdown select UI
- Persists choice to localStorage
- Updates `data-brand` attribute on `<html>` element
- All components react automatically via CSS cascade

### How Brand Switching Works

1. **User selects brand** from dropdown
2. **Component updates** `document.documentElement.setAttribute("data-brand", "simpro")`
3. **CSS selectors match** based on new attribute:
   ```css
   [data-brand="simpro"]:not(.dark) {
     --brand-50: oklch(0.97 0.04 65);  /* SimPro yellow scale */
     /* ... */
   }
   ```
4. **Primitives cascade** down to semantic tokens
5. **UI updates** automatically - no component re-renders needed

### Brand Differences

**BigChange**:
- Brand color: Blue (oklch 0.58 0.27 265) - `#086DFF`
- Use case: Primary brand

**SimPro**:
- Brand color: Dark yellow/amber (oklch 0.72 0.16 65)
- Use case: Alternative brand

**Shared Colors**:
- Status colors (red, orange, green, blue) are identical across brands
- Gray scales are shared
- Only primary brand color differs

### Integration Points

The BrandSwitcher appears on:
- [`src/home.tsx`](src/home.tsx) - Home page
- [`src/tokens.tsx`](src/tokens.tsx) - Token showcase page

---

## Light & Dark Mode

### CSS Selector Strategy

Dark mode is implemented using CSS class selectors (`.dark`) combined with brand data attributes. No JavaScript calculations are required.

### Mode Selector Hierarchy

```css
/* Default (Light BigChange) */
:root { /* ... */ }

/* Light Mode per Brand */
[data-brand="bigchange"]:not(.dark) { /* ... */ }
[data-brand="simpro"]:not(.dark) { /* ... */ }

/* Dark Mode per Brand */
[data-brand="bigchange"].dark { /* ... */ }
[data-brand="simpro"].dark { /* ... */ }
```

### Color Adaptations

#### Light Mode Colors

```css
--hw-text: oklch(0.19 0 0);              /* Dark gray on white */
--hw-text-secondary: var(--gray-600);    /* Medium gray */
--hw-background: oklch(1 0 0);           /* Pure white */
--hw-surface: oklch(0.99 0 0);           /* Off-white */
--hw-interactive: var(--brand-600);      /* Brand 600 */
--hw-border: var(--gray-200);            /* Light border */
```

#### Dark Mode Colors

```css
--hw-text: var(--gray-50);               /* Light gray on dark */
--hw-text-secondary: var(--gray-400);    /* Medium-light gray */
--hw-background: var(--gray-950);        /* Near black */
--hw-surface: var(--gray-900);           /* Dark gray */
--hw-interactive: var(--brand-500);      /* Brand 500 (lighter) */
--hw-border: var(--gray-800);            /* Dark border */
```

### Dark Mode Principles

1. **Lightness Inversion** - Dark text becomes light, light backgrounds become dark
2. **Reduced Contrast** - Dark mode uses slightly lower contrast ratios
3. **Lighter Brand Colors** - Interactive elements use -500 instead of -600 for better visibility
4. **Adjusted Opacity** - Overlays and shadows have mode-specific opacity
5. **OKLCH Consistency** - Perceptual uniformity maintained across modes

### Tailwind Dark Variant

**File**: [`global.css`](global.css)

Custom dark variant configuration:

```css
@custom-variant dark (&:is(.dark *));
```

**Usage**:

```tsx
<div className="bg-hw-background dark:bg-hw-background">
  <p className="text-hw-text dark:text-hw-text">
    Text adapts automatically
  </p>
</div>
```

### Triggering Dark Mode

Add `.dark` class to `<html>` element:

```javascript
document.documentElement.classList.toggle("dark")
```

All components using semantic tokens will automatically adapt.

---

## Development Workflow

### Adding a New Token

1. **Decide token level**:
   - Brand-specific color? → Add to [`styles/primitives/[brand].css`](styles/primitives/)
   - Semantic purpose? → Add to [`styles/tokens.css`](styles/tokens.css)

2. **Add to tokens.css** (example):
   ```css
   [data-brand="bigchange"]:not(.dark) {
     --hw-my-new-token: var(--brand-400);
   }

   [data-brand="bigchange"].dark {
     --hw-my-new-token: var(--brand-300);
   }
   ```

3. **Map to Tailwind** in [`global.css`](global.css):
   ```css
   @theme {
     --color-hw-my-new-token: var(--hw-my-new-token);
   }
   ```

4. **Use in components**:
   ```tsx
   <div className="bg-hw-my-new-token">...</div>
   ```

### Adding a New Brand

1. **Create primitive file**:
   ```bash
   touch styles/primitives/newbrand.css
   ```

2. **Define color scales** using OKLCH:
   ```css
   [data-brand="newbrand"]:not(.dark) {
     --brand-50: oklch(0.97 0.04 120);
     --brand-500: oklch(0.58 0.27 120);  /* Main brand color */
     /* ... complete 50-950 scale */

     /* Gray scale */
     --gray-50: oklch(0.98 0 0);
     /* ... */

     /* Status colors */
     --red-500: oklch(0.55 0.22 25);
     /* ... */
   }

   [data-brand="newbrand"].dark {
     /* Dark mode overrides */
   }
   ```

3. **Import in global.css**:
   ```css
   @import "./styles/primitives/newbrand.css";
   ```

4. **Update BrandSwitcher**:
   ```typescript
   type Brand = "bigchange" | "simpro" | "newbrand"

   const brands = [
     { value: "bigchange", label: "BigChange" },
     { value: "simpro", label: "SimPro" },
     { value: "newbrand", label: "New Brand" }
   ]
   ```

### Modifying Existing Components

1. **Locate component** in [`src/registry/ui/`](src/registry/ui/)
2. **Edit directly** - changes affect all prototypes
3. **Test** in development server (hot reload enabled)
4. **Verify** across brands and modes using BrandSwitcher

### Creating New Components

1. **Add to registry** at [`src/registry/ui/my-component.tsx`](src/registry/ui/)
2. **Use semantic tokens** via Tailwind utilities:
   ```tsx
   export const MyComponent = () => (
     <div className="bg-hw-surface border border-hw-border">
       <p className="text-hw-text">Content</p>
     </div>
   )
   ```
3. **Import in prototypes**:
   ```tsx
   import { MyComponent } from "@/registry/ui/my-component"
   ```

### Testing Tokens

1. **Run dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to** `/tokens` route

3. **Use BrandSwitcher** to test across brands

4. **Toggle dark mode** to verify adaptations

5. **Copy tokens** using built-in clipboard buttons

---

## File Structure

```
/
├── docs/
│   └── design_system.md          # This file
├── src/
│   ├── registry/                 # Component library source of truth
│   │   ├── ui/                   # All UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (17 components)
│   │   ├── lib/
│   │   │   └── utils.ts          # cn() utility
│   │   └── README.md             # Registry documentation
│   ├── components/
│   │   └── BrandSwitcher.tsx     # Brand selection component
│   ├── tokens.tsx                # Token showcase page
│   ├── home.tsx                  # Home page
│   ├── app.tsx                   # Main routing
│   └── main.tsx                  # App entry point
├── styles/
│   ├── tokens.css                # Semantic hw- tokens (multi-brand, light/dark)
│   ├── primitives/
│   │   ├── bigchange.css         # BigChange brand primitives
│   │   └── simpro.css            # SimPro brand primitives
│   └── shadcn.css                # shadcn base tokens
├── global.css                    # Main CSS with imports & Tailwind theme
├── postcss.config.js             # PostCSS + Tailwind config
├── vite.config.ts                # Vite configuration
├── components.json               # shadcn CLI configuration
├── tailwind.config.js            # Tailwind configuration
└── package.json                  # Dependencies & scripts
```

---

## Build Process

### Tech Stack

- **Build Tool**: Vite 7.1.7
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + PostCSS
- **Color Format**: OKLCH (native CSS)
- **Component Base**: Radix UI primitives

### CSS Processing Pipeline

1. **Entry Point** ([`src/main.tsx`](src/main.tsx)):
   ```typescript
   import "./global.css"
   ```

2. **Global CSS Imports** ([`global.css`](global.css)):
   ```css
   @import "tailwindcss";
   @plugin 'tailwindcss-animate';
   @import "./styles/shadcn.css";
   @import "./styles/primitives/bigchange.css";
   @import "./styles/primitives/simpro.css";
   @import "./styles/tokens.css";

   @theme {
     /* Map tokens to Tailwind */
     --color-hw-*: var(--hw-*);
   }
   ```

3. **PostCSS Processing** ([`postcss.config.js`](postcss.config.js)):
   - Tailwind plugin processes directives
   - Autoprefixer adds vendor prefixes
   - CSS custom properties preserved

4. **Vite Plugin** ([`vite.config.ts`](vite.config.ts)):
   ```typescript
   import tailwindcss from "@tailwindcss/vite"

   export default {
     plugins: [
       react(),
       tailwindcss()
     ]
   }
   ```

### Build Commands

**Development**:
```bash
npm run dev          # Start dev server with hot reload
```

**Production**:
```bash
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build
```

**Linting**:
```bash
npm run lint         # ESLint check
```

### Token Compilation

**No build step required** for tokens:
- Tokens are pure CSS custom properties
- OKLCH colors processed natively by browsers
- Cascade happens at CSS layer, not runtime
- Vite hot-reloads CSS changes instantly

**Development Flow**:
1. Edit token in [`styles/tokens.css`](styles/tokens.css)
2. Vite detects change and reprocesses CSS
3. Browser hot-reloads without page refresh
4. All components using token update instantly

### Configuration Files

**[`components.json`](components.json)** - shadcn CLI:
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "global.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "version": "v4"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/registry/lib/utils",
    "ui": "@/registry/ui"
  }
}
```

**[`vite.config.ts`](vite.config.ts)** - Build config:
```typescript
{
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared")
    }
  }
}
```

---

## Best Practices

### Token Usage

- **Always use semantic tokens** (`--hw-*`) in components, never brand primitives directly
- **Use Tailwind utilities** when possible: `bg-hw-interactive` vs inline styles
- **Define purpose, not appearance**: `--hw-interactive` (good) vs `--hw-blue` (bad)
- **Test across brands** before committing token changes

### Component Development

- **Edit registry directly** - don't create duplicate components
- **Use CVA for variants** - maintains consistency with existing components
- **Leverage Radix UI** - accessible primitives reduce custom logic
- **Import from `@/registry/ui`** - never use relative paths

### Color Management

- **Use OKLCH format** for all color definitions
- **Maintain 10-shade scales** (50-950) for consistency
- **Test contrast ratios** especially in dark mode
- **Consider colorblind users** - don't rely on color alone

### Styling

- **Prefer Tailwind utilities** over custom CSS when possible
- **Use semantic tokens** for all colors
- **Avoid hard-coded values** - use design tokens
- **Test responsive** breakpoints across devices

---

## Resources

### Internal Documentation

- [Registry README](src/registry/README.md) - Component library details
- [Token Showcase](src/tokens.tsx) - Interactive token reference

### External References

- [shadcn/ui](https://ui.shadcn.com/) - Component system inspiration
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Utility framework
- [OKLCH Color Space](https://oklch.com/) - Perceptual color picker
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Class Variance Authority](https://cva.style/docs) - Variant system

---

## Contributing

When contributing to the design system:

1. **Discuss major changes** before implementing
2. **Test across all brands** (BigChange, SimPro)
3. **Verify light and dark modes** work correctly
4. **Update this documentation** when adding features
5. **Use semantic commit messages**
6. **Run linting** before committing

### Semantic Commits

- `feat: Add new status token for in-progress states`
- `fix: Correct dark mode contrast in interactive elements`
- `docs: Update token usage examples`
- `refactor: Simplify brand switching logic`

---

**Last Updated**: 2025-10-27
**Version**: 1.0.0
**Maintainer**: Design System Team
