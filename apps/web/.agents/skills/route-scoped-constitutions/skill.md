---
name: route-scoped-constitutions
description: Rules for structuring Server and Client components within a Next.js app/ route folder — client-first, SEO via Server shell
---

### Route-Scoped Constitutions (app/) — Client-First Model

Thin Server shell (routing + metadata only), everything else is Client by default.

1. **`page.tsx` / `layout.tsx` are always Server Components**
   - Never `"use client"` at this level
   - Must export `metadata` (static) or `generateMetadata` (dynamic — e.g. `[id]` routes fetch minimal fields for title/description, `await params` first)
   - Only compose child components — no hooks, no state, no domain data fetching here

2. **Every other component is a Client Component by default — unless it's purely static**
   - `"use client"` at the top for any component using state, hooks, event handlers, or browser-only APIs
   - **Exception:** if a component uses none of the above (e.g. `footer.tsx`, a static CTA) — no data, no interactivity — keep it a Server Component. Don't add `"use client"` just for consistency; it only ships unnecessary JS
   - Fetch data via TanStack Query (Orval-generated hooks), not `cookies()`/server fetchers
   - Kebab-case filenames from the exported name — `ProfileForm` → `profile-form.tsx`

3. **Ordering & decomposition**
   - Page sections get a two-digit prefix — `01-hero.tsx`, `02-availability.tsx` (layout components like header/footer are exempt)
   - Decomposed variants inherit the parent's prefix — `02-availability-filters.tsx`

4. **Colocation**
   - Route components live alongside their `page.tsx`, never imported from another route
   - Shared/reusable components (`@workspace//ui`) are the only exception

5. **Directory Structure**
   ```
   app/home/
   ├── layout.tsx                   # Server — root layout, metadata defaults
   ├── page.tsx                     # Server — metadata + composes below
   ├── header.tsx                   # Client — has interactive nav toggle
   ├── header-sheet.tsx             # Client — decomposed variant of header
   ├── footer.tsx                   # Server — static, no state/handlers, exception applies
   ├── 01-hero.tsx                  # Client — fetches data via TanStack Query
   ├── 02-features.tsx              # Server — static content, no interactivity
   ├── 02-features-card.tsx         # Server, decomposed from 02-features
   └── 03-cta.tsx                   # Server — static text + link, no handlers
   ```