---
name: tailwindcss
displayName: Tailwind CSS v4
description: Tailwind CSS v4 utility-first styling patterns for this project. Use when styling with Tailwind, adding utility classes, configuring the theme, setting up dark mode, or working with shadcn/ui components.
version: 1.0.0
---

# Tailwind CSS v4 — Pantera Negra

This project uses **Tailwind CSS v4** with a CSS-first configuration approach.

## Key Files

- `packages/web/src/index.css` — Tailwind config, theme variables, dark mode
- `packages/web/src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `packages/web/src/components/ui/` — shadcn/ui components

## Core Rules

1. **CSS-first config** — no `tailwind.config.js`. Theme extends via `@theme {}` in `index.css`
2. **Use `cn()`** — always compose classes with `cn()` from `@/lib/utils`
3. **Semantic tokens first** — prefer CSS variable tokens (`bg-primary`, `text-foreground`) over raw colors
4. **Mobile-first** — design for mobile, scale up with `sm:`, `md:`, `lg:`, `xl:`
5. **Dark mode** — use `dark:` variant, configured as class-based (`.dark` on root)

## Class Composition

```tsx
import { cn } from '@/lib/utils'

// Basic
<div className={cn('flex items-center gap-4', isActive && 'text-primary')} />

// With CVA variants
import { cva, type VariantProps } from 'class-variance-authority'

const card = cva('rounded-lg border bg-card text-card-foreground shadow', {
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: { size: 'md' },
})
```

## Semantic Color Tokens

Use these tokens — they adapt automatically to light/dark mode:

| Token | Usage |
|---|---|
| `bg-background` / `text-foreground` | Page background and text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-primary` / `text-primary-foreground` | Brand primary (#EF233C) |
| `bg-secondary` / `text-secondary-foreground` | Brand secondary (#272B30) |
| `bg-muted` / `text-muted-foreground` | Subtle backgrounds and labels |
| `bg-accent` / `text-accent-foreground` | Hover/accent state |
| `bg-destructive` / `text-destructive-foreground` | Errors and destructive actions |
| `border-border` | Borders |
| `ring-ring` | Focus rings |

## Layout Patterns

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Centered Page Layout
```tsx
<main className="min-h-screen bg-background">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {children}
  </div>
</main>
```

### Sticky Header
```tsx
<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
  <div className="container mx-auto px-4 h-16 flex items-center justify-between">
    ...
  </div>
</header>
```

### Sidebar Layout
```tsx
<div className="flex h-screen">
  <aside className="w-64 shrink-0 border-r border-border bg-card">...</aside>
  <main className="flex-1 overflow-auto p-6">...</main>
</div>
```

## Component Patterns

### Button (using shadcn/ui)
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Content</p>
  </CardContent>
</Card>
```

### Form Input (React Hook Form + shadcn)
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

## State Variants

```tsx
// Hover, focus, active
<button className="bg-primary hover:bg-primary/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring transition-colors">

// Group hover
<div className="group cursor-pointer">
  <img className="transition-opacity group-hover:opacity-75" />
  <p className="text-muted-foreground group-hover:text-foreground transition-colors">Text</p>
</div>

// Disabled
<button className="disabled:opacity-50 disabled:cursor-not-allowed" disabled>
```

## Dark Mode

```tsx
// Automatic via semantic tokens (recommended)
<div className="bg-card text-card-foreground" />

// Explicit dark variant when needed
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
<img className="opacity-100 dark:opacity-80" />
```

## Typography

```tsx
<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
<h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
<p className="text-muted-foreground leading-7">
<small className="text-sm font-medium leading-none">
<p className="text-sm text-muted-foreground">Helper text</p>

// Truncate
<p className="truncate">Single line with ellipsis</p>
<p className="line-clamp-3">Max 3 lines with ellipsis</p>
```

## Animations

This project uses `tw-animate-css` and `tailwindcss-animate`:

```tsx
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
<div className="animate-out fade-out slide-out-to-top-4 duration-200">
<div className="transition-all duration-200 ease-in-out">
```

## Arbitrary Values (use sparingly)

```tsx
<div className="top-[117px]" />
<div className="w-[calc(100%-2rem)]" />
<div className="grid-cols-[1fr_300px]" />
```

## Extending the Theme

Add custom tokens in `packages/web/src/index.css`:

```css
@theme {
  --color-brand-500: #EF233C;
  --spacing-18: 4.5rem;
  --font-family-display: 'Playfair Display', serif;
  --breakpoint-3xl: 1920px;
}
```

## Performance Notes

- Tailwind v4 auto-detects template files — no `content` config needed
- Full builds ~100ms (3.5x faster than v3)
- Requires Safari 16.4+, Chrome 111+, Firefox 128+
