# Agents.md

Coding guidelines for this repository.

## Package Manager

- Use pnpm (version 10.18.3)
- Always use pnpm commands, not npm or yarn

## TypeScript

- Only create an abstraction if it's actually needed
- Prefer clear function/variable names over inline comments
- Avoid helper functions when a simple inline expression would suffice
- Use `knip` to remove unused code if making large changes
- The `gh` CLI is installed, use it
- Don't use emojis
- Don't unnecessarily add `try`/`catch`
- Don't cast to `any`

## React

- Avoid massive JSX blocks and compose smaller components
- Colocate code that changes together
- Avoid `useEffect` unless absolutely needed

## Tailwind

- Use Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Always use global CSS file format + shadcn/ui
- Mostly use built-in values, occasionally allow dynamic values, rarely globals
- Use Highway design tokens via CSS custom properties
- Components use semantic tokens (e.g., `bg-hw-interactive`, `text-hw-text`)

## Highway Registry

- Always use `@highway` registry for new components: `npx shadcn@latest add @highway/component-name`
- Components install to `src/registry/ui/`
- Use path aliases: `@/registry/ui/component-name`
- Never manually create components in registry - use the Highway registry

## Vite

- Use Vite 7.1.7 for build tooling
- Path aliases configured: `@/` maps to `./src`, `@shared` maps to `./src/shared`
- Use `pnpm dev` for development server

## Project Structure

- Components live in `src/registry/ui/` (shared component library)
- Prototypes in `src/prototypes/[name]/` with structure: `components/`, `lib/`, `types/`
- Import shared components: `import { Button } from "@/registry/ui/button"`
- Use Zustand for state management in prototypes
- Use React Hook Form + Zod for forms

## Code Quality

- Run `pnpm lint` before committing
- TypeScript strict mode enabled
- ESLint with React Hooks and TypeScript rules

