---
name: data-layer-constitution
description: Rules for structuring application data — centralized vs. route-scoped, CMS-ready primitives, and future-proof API integration
---

### Data Layer Constitution
Prefer centralized, primitive-based data structures that mirror a JSON API response — never hardcode content inside JSX

1. **Scope Rule**
   - **Route-Scoped:** Data used only by one route (e.g., a specific hero section) must live in a `const data` object within that route's component file — `app/home/01-hero.tsx`
   - **Global/Shared:** Data reused across multiple routes (e.g., site config, navigation, full product lists) must live in centralized files — `src/data/` or `src/config/`
   - **Forbidden:** Never duplicate data definitions across routes — import from the centralized store

2. **Entity Store Rule**
   - **Definition:** Major domain entities (Products, Posts, Users) must have a single source of truth in `src/data/` — `src/data/products.ts`
   - **Export:** Export the typed dummy data array or object — `export const productsData: Product[] = [...]`
   - **Filter:** Individual routes may filter or slice this central data for their needs — `productsData.slice(0, 4)` or `productsData.find(p => p.slug === slug)`

3. **Interface Consistency Rule**
   - **Universal:** An entity must have exactly ONE master interface — `Product`, `BlogPost`
   - **Reuse:** All components (Cards, Lists, Detail views) must accept the same master interface via props — do not create `ProductCardData` or `ProductDetailData` variants
   - **Omit:** If a component needs fewer fields, it simply ignores the extra props — never fragment the type

4. **Primitive-Only Rule (CMS Ready)**
   - **Enforce:** All data objects must contain only JSON-serializable primitives — `string`, `number`, `boolean`, `string[]`, nested objects
   - **Forbidden:** No functions, no React JSX elements, no `Date` objects, no class instances inside data objects
   - **Exception:** For icons, use `RemixiconComponentType` directly in route-scoped UI data only. For centralized/entity data, use `iconName: string` and map it to the component in the UI layer

5. **API Migration Rule**
   - **Current:** Use exported `const` arrays/objects from `src/data/` as dummy data
   - **Future:** When integrating a backend, replace the `const` exports with `async` fetch functions in the same files — `export async function getProducts(): Promise<Product[]>`
   - **Invariant:** The consuming components and pages must require zero changes during API migration — only the data source file changes
