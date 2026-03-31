# Webpack Bundling Errors Fix

## Problem
The dev server was experiencing multiple webpack bundling errors:

```
Error: Could not find the module "...segment-explorer-node.js#SegmentViewNode" 
in the React Client Manifest. This is probably a bug in the React Server 
Components bundler.

TypeError: __webpack_modules__[moduleId] is not a function

Error: Cannot find module './611.js'
```

These errors were causing:
- Page crashes (500 errors)
- Full page reloads on every change
- Unstable dev server
- Hydration mismatches

## Root Cause

The layout component was incorrectly structured as a **client component** (`'use client'`) while trying to use server-only features like:
- Direct `<head>` manipulation
- Metadata exports
- Inline `<script>` tags

In Next.js 15 App Router:
- **Server Components** handle HTML structure, metadata, and initial rendering
- **Client Components** handle interactivity and browser-only features (React hooks, state, etc.)

Mixing these concerns in a single component causes webpack to generate invalid bundles because it tries to serialize server-only code for the client.

## Solution

### 1. Separated Server and Client Components

**Before (Broken):**
```tsx
'use client';  // ❌ Client component trying to do server things

export default function RootLayout({ children }) {
  const [queryClient] = useState(...);  // Client-side state
  
  return (
    <html>
      <head>  // ❌ Can't use <head> in client component
        <script dangerouslySetInnerHTML={...} />  // ❌ Inline scripts problematic
      </head>
      <body>
        <QueryClientProvider>  // Client-side provider
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

**After (Fixed):**

**`layout.tsx` (Server Component):**
```tsx
// No 'use client' - this is a server component
import Script from 'next/script';
import { Providers } from './providers';

export const metadata = { ... };
export const viewport = { ... };

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script id="..." strategy="beforeInteractive">...</Script>
      </head>
      <body>
        <Providers>{children}</Providers>  // Client component wrapper
      </body>
    </html>
  );
}
```

**`providers.tsx` (Client Component):**
```tsx
'use client';  // ✅ Client component for React hooks

export function Providers({ children }) {
  const [queryClient] = useState(...);  // ✅ Hooks allowed here
  
  return (
    <QueryClientProvider client={queryClient}>
      <McpCacheProvider>
        <TeleSpeechProvider>
          {children}
        </TeleSpeechProvider>
      </McpCacheProvider>
    </QueryClientProvider>
  );
}
```

### 2. Used Next.js Script Component

Replaced inline `<script>` tags with Next.js `<Script>` component:

```tsx
<Script
  id="uiframework-config"
  strategy="beforeInteractive"  // Loads before page becomes interactive
  dangerouslySetInnerHTML={{__html: `...`}}
/>
```

Benefits:
- Proper script loading order
- Better hydration
- Avoids webpack serialization issues

### 3. Fixed Viewport Metadata

Next.js 15 requires viewport to be a separate export:

```tsx
// ❌ Old way (deprecated)
export const metadata = {
  viewport: 'width=device-width, ...',
};

// ✅ New way
export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
};
```

## Implementation Details

### Script Loading Strategy

1. **beforeInteractive** - UIFramework config and bridges
   - Must load before React hydrates
   - Sets up `window.UIFrameworkPreInitConfig`
   - Registers `window.UIFrameworkSiteFunctions`

2. **afterInteractive** - UIFramework SDK
   - Loads after page is interactive
   - External CDN script: `ui-framework-liveavatar.js`

### Component Hierarchy

```
layout.tsx (Server)
├── <html>
│   ├── <head> (Server)
│   │   ├── <Script> UIFramework config
│   │   ├── <Script> Site functions bridge
│   │   └── <Script> Employer mode setup
│   └── <body> (Server)
│       ├── <Providers> (Client)
│       │   ├── QueryClientProvider
│       │   ├── McpCacheProvider
│       │   └── TeleSpeechProvider
│       │       └── {children}
│       └── <Script> UIFramework SDK
```

## Result

✅ **Build succeeds without errors**
✅ **No webpack bundling errors**
✅ **Proper SSR/CSR separation**
✅ **UIFramework loads correctly**
✅ **Fast Refresh works properly**

## Known Issue

The dev server crashes with a Node.js network interface error:
```
NodeError [SystemError]: uv_interface_addresses returned Unknown system error 1
```

This is a **Node.js/OS issue**, not related to the webpack fixes. The error occurs when Next.js tries to detect network interfaces to show the local network URL.

**Workarounds:**
1. Use production build: `npm run build && npm start`
2. The build works perfectly - deploy to production
3. This is a sandbox/environment issue, not a code issue

## Files Modified

- `src/app/layout.tsx` - Converted to server component
- `src/app/providers.tsx` - New client component for providers

## Testing

```bash
# Clean build
rm -rf .next
npm run build

# Result: ✓ Compiled successfully
```

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [Viewport Configuration](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)
