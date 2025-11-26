# BigChange Labs

Design prototype playground for testing concepts with customers - aligned with BigChange MFE Suite.

## Overview

BigChange Labs is a design system playground that enables rapid prototyping and customer concept testing. Built with modern web technologies, it features a registry-style component library with full light/dark mode support.

### Key Features

- 🎯 **Registry-Based Components** - Shared component library as single source of truth
- ⚡ **Fast Iteration** - Hot reload enabled, edit once and updates everywhere
- 🌓 **Light & Dark Modes** - Full theme support
- 🎨 **OKLCH Color Space** - Perceptually uniform colors for better accessibility
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
│   ├── components/        # App-specific components
│   ├── prototypes/        # Design prototypes organized by feature
│   │   └── [prototype-name]/    # Example: asset-attributes, job-scheduler, etc.
│   │       ├── components/      # Prototype-specific components
│   │       │   ├── pages/       # Page-level components
│   │       │   ├── features/    # Feature-specific UI logic
│   │       │   └── layout.tsx   # Prototype layout wrapper
│   │       ├── lib/             # Prototype utilities
│   │       │   ├── validation.ts
│   │       │   └── utils.ts
│   │       └── types/           # TypeScript type definitions
│   ├── data/             # Static data and configuration
│   ├── tokens.tsx        # Interactive token showcase page
│   ├── home.tsx          # Home page
│   └── app.tsx           # Main routing
├── styles/
│   ├── tokens.css        # Semantic design tokens
│   └── primitives/       # Brand-specific color primitives
│       ├── bigchange.css # BigChange brand colors
│       └── simpro.css    # SimPro brand colors
├── docs/                 # Documentation
├── public/               # Static assets
└── global.css            # Main CSS entry point
```

## Design System

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

### Token Architecture

The design system uses a three-layer token architecture:

1. **Brand Primitives** (`styles/primitives/`) - Raw OKLCH color scales
2. **Semantic Tokens** (`styles/tokens.css`) - Purpose-based names like `--hw-interactive`, `--hw-text`
3. **Tailwind Utilities** - Classes like `bg-hw-interactive`, `text-hw-text`

## Documentation

- **[Design System Guide](docs/design_system.md)** - Comprehensive design system documentation
- **[MFE Setup Guide](docs/mfe_setup.md)** - Micro-frontend architecture setup
- **Token Showcase** - Interactive token reference at `/tokens` route

## Development Workflow

### Creating a New Prototype

Use the `/new-prototype` slash command in Claude Code to automatically scaffold a new prototype with the proper structure:

```
/new-prototype
```

This command will:
- Ask for the prototype name, description, device type, and visibility
- Create the complete prototype structure with necessary files
- Update routing configuration
- Register the prototype in the app

Alternatively, you can manually create a prototype:

1. Create a new directory under `src/prototypes/`:
   ```bash
   mkdir -p src/prototypes/my-prototype/{components,lib,types}
   ```

2. Organize your prototype with the following structure:
   ```
   src/prototypes/my-prototype/
   ├── App.tsx              # Main app component
   ├── components/
   │   ├── pages/           # Page components
   │   ├── features/        # Feature-specific logic
   │   └── layout.tsx       # Layout wrapper
   ├── lib/                 # Utilities and helpers
   │   ├── store.ts         # Zustand state management
   │   └── mock-data.ts     # Mock data
   └── types/               # TypeScript types
   ```

3. Import shared components from the registry:
   ```typescript
   import { Button, Card } from "@/registry/ui/button"
   ```

### Removing a Prototype

Use the `/remove-prototype` slash command to cleanly remove a prototype:

```
/remove-prototype
```

This command will remove all prototype files, routes, and configuration.

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
- Toggle dark mode to verify adaptations

## Environment Configuration

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

## Contributing

When contributing to this project:

1. Run linting before committing: `pnpm lint`
2. Use semantic commit messages
3. Update documentation when adding features

## License

This project is private and proprietary to BigChange.

## Support

For questions or issues, please contact the Design System Team.
