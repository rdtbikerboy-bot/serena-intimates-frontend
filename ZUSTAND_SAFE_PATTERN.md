# Zustand Safe Pattern for SSR in Next.js App Router

## Official Repository Rule

In this repository, we enforce strict boundaries to prevent SSR Hydration leaks and Next.js boundary violations. Zustand stores MUST NOT be accessed directly by Server Components. 

### Allowed Pattern

```text
Server Component
       ↓
Client Wrapper ("use client")
       ↓
Interactive UI
       ↓
Zustand / Browser APIs (window, localStorage, document)
```

## Rules & Forbidden Patterns

### 1. ❌ Forbidden: Importing Zustand in Server Components
Never import any Zustand store (`useCartStore`, `useUIStore`, etc.) directly into a Server Component (like `page.tsx` or `layout.tsx`). This breaks the SSR build and causes hydration errors.

**Bad:**
```tsx
// app/page.tsx
import { useCartStore } from "@/store/useCartStore"; // ❌ SSR LEAK!

export default function Page() {
  const items = useCartStore(state => state.items); // ❌ FAILS BUILD
  return <div>{items.length}</div>;
}
```

### 2. ✅ Allowed: Wrapping with a Client Component
Create a wrapper component with the `"use client"` directive to bridge the boundary.

**Good:**
```tsx
// app/page.tsx
import ClientCartCount from "./ClientCartCount";

export default function Page() {
  return <ClientCartCount />; // ✅ SAFE
}

// ClientCartCount.tsx
"use client";
import { useCartStore } from "@/store/useCartStore";

export default function ClientCartCount() {
  const items = useCartStore(state => state.items);
  return <div>{items.length}</div>;
}
```

### 3. ❌ Forbidden: Browser APIs in Server Components or Initial Store States
Do not use `window`, `localStorage`, `sessionStorage`, or `document` inside Server Components or during the initial evaluation of a Zustand store without safeguards. 

**Bad:**
```tsx
const initialState = localStorage.getItem('cart') || []; // ❌ CRASHES SSR
```

### 4. ✅ Allowed: Deferring Browser APIs to useEffect
If a Client component needs to read from `localStorage`, either wrap the logic in a `useEffect` hook to ensure it runs only on the client, or use lazy initialization inside a component.

```tsx
"use client";
import { useEffect, useState } from "react";

export default function PersistedComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // ✅ SAFE: Runs only on the client
    setData(localStorage.getItem('data'));
  }, []);

  return <div>{data}</div>;
}
```

## Summary
By keeping all Zustand and Browser API usage strictly inside components explicitly marked with `"use client"`, we guarantee functional server-side rendering while preserving rich client interactions.
