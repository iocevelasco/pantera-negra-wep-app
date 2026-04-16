# Pantera Negra Web App — Claude Guidelines

## Project Overview

Monorepo (pnpm workspaces) with two packages:
- `packages/web` — Frontend: Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui
- `packages/api` — Backend: Node.js + Express + TypeScript

## Tech Stack (Frontend)

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** — CSS-first config via `packages/web/src/index.css`
- **shadcn/ui** (New York style) — components in `packages/web/src/components/ui/`
- **Radix UI** primitives
- **class-variance-authority (CVA)** + **tailwind-merge (twMerge)** + **clsx** for class composition
- **React Hook Form** + **Zod** for forms
- **TanStack Query v5** for server state
- **React Router v6** for routing
- **Zustand** for client state
- **i18next** for internationalization
- **Lucide React** for icons

## Tailwind CSS v4 Setup

### Configuration is CSS-first
No `tailwind.config.js`. Everything lives in `packages/web/src/index.css`:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

@theme {
  /* Brand colors */
  --color-primary: #EF233C;
  --color-secondary: #272B30;
  /* ... */
}
```

### Brand Colors
- **primary**: `#EF233C` (red)
- **secondary**: `#272B30` (dark gray)
- **destructive**: `#D90429`
- All semantic tokens are CSS variables using `oklch()` color space

### Dark Mode
Uses class-based dark mode: `.dark` class on root element (via `next-themes`).
Custom variant defined as: `@custom-variant dark (&:is(.dark *))`.

## Component Conventions

### Class Composition
Always use `cn()` from `@/lib/utils` (combines `clsx` + `tailwind-merge`):

```tsx
import { cn } from '@/lib/utils'

<div className={cn('base-classes', condition && 'conditional-class', className)} />
```

### shadcn/ui Components
- Located in `packages/web/src/components/ui/`
- Never modify `ui/` components directly — extend via `className` prop or wrap them
- Use CVA for variant-driven components

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      outline: 'border border-input bg-background',
    },
    size: {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})
```

### CSS Variable Tokens (shadcn)
Use semantic CSS variable tokens in Tailwind classes — not raw colors:

```tsx
// Correct
<div className="bg-background text-foreground border-border" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-muted text-muted-foreground" />

// Avoid — bypasses theming
<div className="bg-[#EF233C] text-white" />
```

## Tailwind v4 Patterns

### Responsive (mobile-first)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
<h1 className="text-2xl md:text-4xl lg:text-6xl" />
```

### Dark Mode
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
```

### Arbitrary Values (use sparingly)
```tsx
<div className="top-[117px] bg-[#custom] grid-cols-[200px_1fr]" />
```

### @apply (only in CSS files, not JSX)
```css
.custom-class {
  @apply px-4 py-2 bg-primary text-primary-foreground rounded-md;
}
```

## Project Commands

```bash
pnpm dev          # Run all packages
pnpm dev:web      # Frontend only
pnpm dev:api      # Backend only
pnpm build        # Build all
pnpm typecheck    # Type-check all
pnpm lint         # Lint all
pnpm format       # Prettier
```

## File Structure (Frontend)

```
packages/web/src/
├── components/
│   ├── ui/          # shadcn/ui components (don't modify directly)
│   └── ...          # App components
├── hooks/
├── lib/
│   └── utils.ts     # cn() helper
├── pages/
├── store/           # Zustand stores
├── index.css        # Tailwind v4 CSS config + theme variables
└── main.tsx
```

## Important Notes

- **Tailwind v4** — no `tailwind.config.js`, config is in `index.css` via `@theme {}`
- **React 19** — use `use()` hook for async, Server Components not applicable (Vite)
- **pnpm** — always use `pnpm`, never `npm` or `yarn`
- **Monorepo imports** — shared types from `@pantera-negra/shared`
- **Icons** — use Lucide React, not emojis or other icon libraries
