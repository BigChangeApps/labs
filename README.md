# BigChange Labs

Design prototype playground for testing concepts with customers - aligned with BigChange MFE Suite.

## Overview

BigChange Labs is a **multi-brand design system** playground that enables rapid prototyping and customer concept testing. Built with modern web technologies, it features a registry-style component library with real-time brand switching and full light/dark mode support.

### Key Features

- 🎨 **Multi-Brand Support** - Switch between BigChange and SimPro brands in real-time
- 🌓 **Light & Dark Modes** - Full theme support across all brands
- 🎯 **Registry-Based Components** - Shared component library as single source of truth
- 🎨 **OKLCH Color Space** - Perceptually uniform colors for better accessibility
- ⚡ **Fast Iteration** - Hot reload enabled, edit once and updates everywhere
- 🔧 **Modern Stack** - Vite + React + TypeScript + Tailwind CSS v4

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS v4 with OKLCH colors
- **Components**: Radix UI primitives
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm 10.18.3 (specified in package.json)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BigChangeApps/labs.git
cd labs
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (TypeScript compile + Vite build)
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint checks
- `pnpm generate:thumbnails` - Generate prototype thumbnails

## Project Structure

```
.
├── src/
│   ├── registry/          # Component library (single source of truth)
│   │   └── ui/           # All UI components (Button, Card, Dialog, etc.)
│   ├── components/        # App-specific components (BrandSwitcher, etc.)
│   ├── prototypes/        # Design prototypes and experiments
│   ├── data/             # Static data and configuration
│   ├── tokens.tsx        # Interactive token showcase page
│   ├── home.tsx          # Home page
│   └── app.tsx           # Main routing
├── styles/
│   ├── tokens.css        # Semantic hw- tokens (multi-brand support)
│   └── primitives/       # Brand-specific color primitives
│       ├── bigchange.css # BigChange brand colors
│       └── simpro.css    # SimPro brand colors
├── docs/                 # Documentation
├── public/               # Static assets
└── global.css            # Main CSS entry point
```

## Design System

### Three-Layer Token Architecture

1. **Brand Primitives** (`styles/primitives/`) - Raw OKLCH color scales per brand
2. **Semantic Tokens** (`styles/tokens.css`) - Purpose-based names like `--hw-interactive`, `--hw-text`
3. **Tailwind Utilities** - Classes like `bg-hw-interactive`, `text-hw-text`

### Component Library

All UI components are located in `src/registry/ui/` and serve as a single source of truth:

```typescript
import { Button } from "@/registry/ui/button"
import { Card } from "@/registry/ui/card"
```

Available components:
- Button, Card, Dialog, Input, Select
- Accordion, Avatar, Badge, Alert, Label
- Popover, Separator, Sheet, Switch, Table
- Tooltip, Kbd

### Brand Switching

Switch between brands using the `BrandSwitcher` component. Changes are:
- Applied instantly via CSS data attributes
- Persisted to localStorage
- Completely CSS-driven (no JavaScript re-renders needed)

## Documentation

- **[Design System Guide](docs/design_system.md)** - Comprehensive design system documentation
- **[MFE Setup Guide](docs/mfe_setup.md)** - Micro-frontend architecture setup
- **Token Showcase** - Interactive token reference at `/tokens` route

## Development Workflow

### Adding a New Component

1. Create component in `src/registry/ui/my-component.tsx`
2. Use semantic tokens via Tailwind utilities
3. Import in prototypes: `import { MyComponent } from "@/registry/ui/my-component"`

### Adding a New Token

1. Add to `styles/tokens.css` with light/dark variants
2. Map to Tailwind in `global.css` `@theme` section
3. Use in components: `className="bg-hw-my-token"`

### Testing

- Run dev server: `pnpm dev`
- Navigate to `/tokens` to view all tokens
- Use BrandSwitcher to test across brands
- Toggle dark mode to verify adaptations

## Environment Configuration

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

## Contributing

When contributing to this project:

1. Test across all brands (BigChange, SimPro)
2. Verify light and dark modes work correctly
3. Run linting before committing: `pnpm lint`
4. Use semantic commit messages
5. Update documentation when adding features

## License

This project is private and proprietary to BigChange.

## Support

For questions or issues, please contact the Design System Team.
