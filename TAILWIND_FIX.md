# Tailwind CSS Configuration Fix

## Problem
The project was experiencing a build error:
```
Syntax error: tailwindcss: Cannot apply unknown utility class `border-border`
```

This occurred because the `src/index.css` file (copied from trainco-v1) used Tailwind utility classes that were defined in trainco-v1's `tailwind.config.ts` but were missing in test-site-2.

## Solution

### 1. Copied Tailwind Configuration
Copied `tailwind.config.ts` from trainco-v1 to test-site-2, which includes:
- Custom color definitions (including `border` color that enables `border-border` utility)
- Custom border radius values
- Custom font families and letter spacing
- Custom animations and keyframes
- App design system tokens

### 2. Updated Content Paths
Modified the Tailwind config to work with Next.js App Router:
```typescript
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
]
```

### 3. Downgraded to Tailwind v3
The project had Tailwind CSS v4 installed, which has breaking changes. Downgraded to v3.4.17 for compatibility with the trainco-v1 configuration:
```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install tailwindcss@^3.4.17 --save-dev
```

### 4. Fixed PostCSS Configuration
Created `postcss.config.mjs` with proper ESM export format:
```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
```

### 5. Installed Missing Dependencies
- `@tailwindcss/typography` - For typography utilities
- `autoprefixer` - For vendor prefixes

### 6. Fixed Next.js Configuration
- Removed `output: 'export'` from `next.config.ts` to enable API routes (needed for mock MCP backend)
- Fixed API route handler type for Next.js 15 (params as Promise)

### 7. Added ESLint Configuration
Created `.eslintrc.json` with Next.js config to enable linting during builds.

## Result
✅ Build now completes successfully
✅ All Tailwind utilities are recognized
✅ TypeScript compilation passes
✅ No linter errors

## Files Modified
- `tailwind.config.ts` (copied and updated)
- `postcss.config.mjs` (created)
- `next.config.ts` (removed static export)
- `package.json` (updated dependencies)
- `.eslintrc.json` (created)
- `src/app/api/invoke/[toolName]/route.ts` (fixed type)

## Build Output
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    1.27 kB         104 kB
├ ○ /_not-found                            999 B         104 kB
└ ƒ /api/invoke/[toolName]                 123 B         103 kB
```

Build completed successfully with no errors.
