# Claude Context - Design Prototypes Playground

## Project Overview
This is a design prototype playground for testing concepts with customers, aligned with the BigChange MFE Suite. It's a React + TypeScript application built with Vite.

## Tech Stack
- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 4.1 with custom animations
- **UI Components**: Radix UI primitives (dialogs, popovers, selects, etc.)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM
- **State Management**: Zustand
- **Drag & Drop**: dnd-kit
- **Package Manager**: pnpm 10.18.3

## Project Structure
```
labs/
├── src/
│   └── prototypes/          # Individual prototype implementations
│       └── asset-attributes/ # Current prototype for asset attributes
├── scripts/                 # Build and utility scripts
├── public/                  # Static assets
├── docs/                    # Documentation
├── .claude/                 # Claude Code configuration
│   └── commands/            # Custom slash commands
└── styles/                  # Global styles
```

## Development Commands
```bash
pnpm dev                    # Start development server
pnpm build                  # Type check and build for production
pnpm lint                   # Run ESLint
pnpm preview                # Preview production build
pnpm generate:thumbnails    # Generate prototype thumbnails
```

## Important Notes
- This is a prototype/playground repo - focus is on rapid experimentation
- Always run `npx tsc --noEmit` before committing to ensure type safety
- Use the existing Radix UI + Tailwind component patterns
- Prototypes should be self-contained within their directories

## MCP Servers
This project uses Model Context Protocol (MCP) servers to extend Claude Code capabilities:

**Project-level servers** (configured in `.mcp.json`):
- **Playwright** - Browser automation and testing for UI prototypes
- **Chrome DevTools** - Performance analysis, debugging, and browser inspection

These servers are automatically available to all team members when using Claude Code in this project.

## Custom Slash Commands
Available commands in `.claude/commands/`:
- `/commit-push-quick` - Quick commit and push with fast validation (tsc + lint)
- `/commit-push` - Commit and push with full validation (tsc + lint + build)
- `/pr` - Create a pull request with full validation checks
- `/new-prototype` - Scaffold a new prototype in the prototypes directory
- `/remove-prototype` - Remove a prototype from the prototypes directory

## Coding Standards
- Use TypeScript strict mode
- Follow existing component patterns (see asset-attributes prototype)
- Leverage Radix UI primitives for accessibility
- Use Tailwind utility classes for styling
- Implement proper form validation with Zod schemas
- Keep components focused and composable
