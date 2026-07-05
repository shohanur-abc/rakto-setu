---
name: reusable-components
description: Enforces shadcn/ui as the only UI primitive source — custom components are forbidden unless shadcn/ui cannot cover the use case
---

### Reusable Components & UI Primitives (shadcn/ui)
Prefer shadcn/ui components over raw HTML elements or custom components

1. **Conversion Rule**
   - **Enforce:** Every button, input, card, dialog, dropdown — all of it must use shadcn/ui. No native HTML elements, no raw CSS components, no other UI library

2. **Custom Primitive Rule**
   - **Forbidden:** Custom components are not allowed unless shadcn/ui literally cannot cover the use case
   - **Proof:** Before building custom, prove that composing existing shadcn/ui components was attempted and failed — "I felt like building it" is not a valid excuse

3. **Reinvention Rule**
   - **Forbidden:** Do not build what shadcn/ui already provides — `Accordion`, `Alert`, `AlertDialog`, `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `ButtonGroup`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Combobox`, `Command`, `ContextMenu`, `Dialog`, `Drawer`, `DropdownMenu`, `Empty`, `Field`, `Form`, `HoverCard`, `Input`, `InputGroup`, `InputOtp`, `Kbd`, `Label`, `Menubar`, `NavigationMenu`, `Pagination`, `Popover`, `Progress`, `RadioGroup`, `Resizable`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Sonner`, `Spinner`, `Switch`, `Table`, `Tabs`, `Textarea`, `Toggle`, `ToggleGroup`, `Tooltip` and other primitives

4. **Decision Rule**
   - **First:** Which shadcn/ui component handles this?
   - **Second:** How do I compose them?
   - **Third:** Only after both fail — I need something custom

5. **Shared Component Rule**
   - **Extract:** Any component used in more than one route must be extracted to `@/components/` — never duplicated across routes
