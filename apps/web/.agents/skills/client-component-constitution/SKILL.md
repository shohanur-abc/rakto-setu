---
name: Client Component Constitution
description: Rules for when and how to use Client Components in a Next.js app/ route folder — boundary, wrapper pattern, and state management
---

### Client Component Constitution (`_client/`)
Prefer Server Components over Client Components by default

1. **Client Boundary Rule**
   - **Default:** `"use client"` boundary is a last resort, not a default
   - **Allowed:** hooks, event handlers, browser-only APIs only — always scoped to the exact element that needs interactivity
   - **Forbidden:** data fetching, DB queries, filesystem access, layout composition, styling decisions, data transformation — server-side, period

2. **Wrapper Rule**
   - **Definition:** A Client Component is a thin wrapper — only state, handlers, or browser APIs inside, everything else as `children` or props
   - **Pattern:** Extend `ComponentProps<T>` to keep client-side code separate while giving the Server Component full access to the root element's native props

3. **State Management Rule**
   - **Default:** Use `useState` by default
   - **Shared State:** Use `zustand` only when state must be shared across multiple components
   - **Scope:** Wrap only the exact element that needs state — not its siblings or parent — to prevent unnecessary re-renders

```tsx
"use client";
import { Dialog } from '@/components/ui/dialog';
import { CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { create } from 'zustand'


const useDialogStore = create<DialogStore>((set) => ({
    dialogOpen: false,
    setDialogOpen: (open) => set((state) => ({
        dialogOpen: typeof open === 'function' ? open(state.dialogOpen) : open,
    })),
}))


export const DialogClient = ({ children, ...rest }: DialogClientProps) => {
    const { dialogOpen, setDialogOpen } = useDialogStore();

    useEffect(() => {...}, []);
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} {...rest}>
            {children}
        </Dialog>
    )
}


export const CommandItemClient = ({ children, ...rest }: CommandItemClientProps) => {
    const setDialogOpen = useDialogStore(s => s.setDialogOpen);
    return (
        <CommandItem onSelect={() => setDialogOpen(false)} {...rest} >
            {children}
        </CommandItem >
    )
}


export const SearchButtonClient = ({ children, ...rest }: SearchButtonClientProps) => {
    const setDialogOpen = useDialogStore(s => s.setDialogOpen);
    return (
        <Button onClick={() => setDialogOpen(true)} {...rest}>
            {children}
        </Button>
    )
}


// ===================== Types =====================

type DialogOpenUpdater = boolean | ((open: boolean) => boolean);

interface DialogStore {
    dialogOpen: boolean;
    setDialogOpen: (open: DialogOpenUpdater) => void;
}

interface DialogClientProps extends React.ComponentProps<typeof Dialog> { }
interface CommandItemClientProps extends React.ComponentProps<typeof CommandItem> { }
interface SearchButtonClientProps extends React.ComponentProps<'button'> { }
```
