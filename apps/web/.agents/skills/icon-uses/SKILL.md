---
name: icon-uses
description: Rules for using @remixicon/react — prefer Remix icons over raw SVG, import only used icons, and use correct types
---

### Icon Uses Constitution (`@remixicon/react`)
Prefer Remix icons over raw SVG elements

1. **Icon Rule**
   - **Replace:** Raw SVG elements must be replaced with Remix icons — never write raw SVG manually
   - **Match:** If an original SVG exists, match it to the closest Remix icon equivalent

2. **Import Rule**
   - **Scope:** Import only the icons that are used — never import the entire library

3. **Type Rule**
   - **Type:** `RemixiconComponentType`
   - **Prefix:** All Remix icon component names are prefixed with `Ri` — e.g., `RiHomeLine`, `RiArrowRightSLine`
