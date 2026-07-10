---
name: tailwind-constitution
description: Rules for writing Tailwind CSS — valid utilities, theme mapping, canonical scales, modern syntax, and container queries over viewport breakpoints
---

### Tailwind CSS Constitution
Prefer Tailwind-native utilities over raw CSS values and viewport breakpoints

1. **Class Validity Rule**
   - **Replace:** Invalid, deprecated, or custom classes must be replaced with the closest valid Tailwind equivalent

2. **Design Token Rule**
   - **Convert:** Raw HTML/CSS theme values (inline hex codes, legacy framework colors) must be mapped to the project's defined Tailwind configuration theme — `bg-[#1a202c]` → `bg-background`
   - **Tokens:** Use design tokens for all theme-driven colors — avoid raw Tailwind color classes for themeable UI
   - **Themeable UI:** For any UI that needs to support light/dark mode or theme switching, use the following design tokens: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`, `chart-1` through `chart-5`, `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring`, `radius` — Examples: `text-primary`, `bg-card`, `border-border`
   - **Exception:** Raw Tailwind colors (e.g., `bg-red-500`) may only be used when the color must not change with theme — always add a comment explaining the exception

3. **Scale Rule**
   - **Convert:** Arbitrary pixel or absolute values must be converted to canonical Tailwind spacing and sizing scales whenever an exact or near-exact match exists — `space-y-[2px]` → `space-y-0.5`, `mt-[2px]` → `mt-0.5`, `size-[34px]` → `size-8.5`, `@md:min-w-[136px]` → `@md:min-w-34`

4. **CSS Variable Rule**
   - **Enforce:** Use Tailwind v4+ shorthand syntax for CSS variables — never the legacy arbitrary value wrapper — `max-w-[var(--sidebar-width)]` → `max-w-(--sidebar-width)`

5. **Container Query Rule**
   - **Use:** Container query breakpoints only — `@md:`, `@2xl:`, `@5xl:`, `@7xl:`, `@max-md:flex-col`
   - **Forbidden:** Viewport breakpoints — never use `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
   - **Setup:** Add `@container` once at `<body><div className="@container">{children}</div></body>`
   - **Mapping:** `tablet` → `@2xl:`, `laptop` → `@5xl:`, `desktop` → `@7xl:`
   - **Reference:** https://tailwindcss.com/docs/responsive-design
