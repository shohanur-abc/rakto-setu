---
name: nextjs-uses
description: Rules for how and when to use Next.js features and APIs
---

### Next.js Uses Constitution
Prefer Next.js-native components over raw HTML elements

1. **Mapping Rule**
   - **Image:** `<img>` → `Image` from `next/image` — requires `alt`, `width`/`height` or `fill` with a positioned parent. Prioritize static imports for automatic optimization
   - **Link:** `<a>` (internal navigation) → `Link` from `next/link` — internal navigation only
   - **Anchor:** `<a>` (external) → keep `<a>` — for `mailto:`, `tel:`, downloads, and external URLs
   - **Script:** `<script>` → `Script` from `next/script` — third-party scripts only
   - **Form:** `<form>` (route/search navigation) → `Form` from `next/form` — navigation or search forms only
   - **Metadata:** `<head>` tags → Metadata API — export a `metadata` object from the route
   - **Font:** font `<link>` tags → `next/font` — use local font module

2. **Cache components Rule**
   - **Reference:** Follow `.agents/skills/next-cache-components/SKILL.md`
