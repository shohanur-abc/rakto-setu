---
name: route-scoped-constitutions
description: Rules for structuring Server and Client components within a Next.js app/ route folder — colocation, naming, ordering, and decomposition
---

### Route-Scoped Constitutions (app/)
Prefer strict separation of Server and Client components via folder conventions

1. **File Convention Rule**
   - **Decomposition:** If a component grows large or has variants, extract them into suffixed files — Server or Client — and import them back into the base component — `header-sheet.tsx`, `header-drawer.tsx` are composed inside `header.tsx`
   - **Order Prefix:** Page-level sections and slots must be prefixed with a two-digit number representing their top-to-bottom visual order — `01-hero.tsx`, `02-collection.tsx`. Layout-level components (header, footer, sidebar) are exempt
   - **Decomposition Prefix:** Decomposed variants inherit the parent's prefix — `02-collection-carousel.tsx`, `02-collection-details-dialog.tsx`

2. **Route-Scoped Server Component Rule**
   - **Definition:** A Route-Scoped Server Component is a route-specific unit — a section, slot, or any UI unit composed in `page.tsx` or `layout.tsx`, never shared or reused outside this route
   - **Filename:** Route-Scoped Server Component filenames must be in kebab-case and derived from the exported component name — `Hero` → `hero.tsx`, `CallToAction` → `call-to-action.tsx`
   - **Composition:** Route-Scoped Server Components are composed in `layout.tsx` (layout-level) or `page.tsx` (sections and slots) — neither file may ever be a Client Component
   - **Client Import:** If a Route-Scoped Server Component requires a Client Wrapper, it must import it from `_client/`

3. **Client Wrapper Rule**
   - **Definition:** A Client Wrapper is a Route-Scoped Server Component's client-side counterpart — stripped down to only state and event handlers, nothing that can live on the server
   - **Filename:** Client Wrapper filename in `_client/` must match its Route-Scoped Server Component counterpart one-to-one — `hero.tsx` → `_client/hero.tsx`
   - **Creation:** `_client/` is created only when a Client Wrapper is absolutely required — never by default
   - **Boundary:** `"use client"` must never appear outside `_client/`

4. **Colocation Rule**
   - **Forbidden:** Do not import Route-Scoped Server Components or Client Wrappers from outside the route folder — they must live alongside `page.tsx`
   - **Exception:** Shared and reusable components may be imported from outside

5. **Directory Structure**
   ```
   app/home/
   ├── _client/
   │   ├── header.tsx
   │   ├── 02-collection-carousel.tsx
   │   └── 02-collection-details-dialog.tsx
   ├── footer.tsx
   ├── header.tsx
   ├── header-sheet.tsx
   ├── header-drawer.tsx
   ├── 01-hero.tsx
   ├── 02-collection.tsx
   ├── 02-collection-carousel.tsx
   ├── 02-collection-details-dialog.tsx
   ├── 03-call-to-action.tsx
   ├── 04-download.tsx
   ├── layout.tsx
   └── page.tsx
   ```
