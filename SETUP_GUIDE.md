# 🚀 Setup Guide: Getting Trainco Running

You have two options to get the website running:

## Option 1: Use Trainco App (Full Features) ⭐ RECOMMENDED

This gives you the complete trainco experience with voice AI, job search, career tracking, etc.

### Steps:

1. **Update Next.js to use Trainco App**

Replace `src/app/page.tsx` with:

```tsx
'use client';

import dynamic from 'next/dynamic';

const TraincoApp = dynamic(() => import('@/App'), { ssr: false });

export default function Home() {
  return <TraincoApp />;
}
```

2. **Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeleSpeechProvider } from '@/contexts/TeleSpeechContext';
import { McpCacheProvider } from '@/contexts/McpCacheContext';
import '@/index.css'; // Use trainco styles

const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || 'Trainco AI';

export const metadata: Metadata = {
  title: agentName,
  description: `Talk to ${agentName} - Career AI Assistant`,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <McpCacheProvider>
            <TeleSpeechProvider>
              {children}
            </TeleSpeechProvider>
          </McpCacheProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

3. **Create `.env.local`**

```env
# Trainco Backend (if you have one)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Development
NEXT_PUBLIC_DEV_TOOLBAR_HOST=localhost

# Agent Name
NEXT_PUBLIC_AGENT_NAME=Trainco AI
```

4. **Run the app**

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Option 2: Keep Existing Next.js App (Simpler)

Keep your current setup and just use the imported components as needed.

### What You Get:
- Your existing Next.js structure
- Access to all trainco components
- DSL card system
- Chart components

### What You Need:
- Import trainco components where needed
- Set up contexts manually
- Configure voice features if needed

### Example Usage:

```tsx
// In any page
import { JobCard } from '@/components/cards';
import { CircularGauge } from '@/components/charts';
import { Dashboard } from '@/components/templates';

export default function MyPage() {
  return (
    <div>
      <JobCard 
        title="Senior Developer"
        company="Tech Corp"
        salary="20,000"
        location="Riyadh"
        matchScore={85}
      />
      <CircularGauge percentage={75} />
    </div>
  );
}
```

---

## Quick Fixes for Common Issues

### Issue 1: Missing Components

If you see errors about missing voice components:

```bash
# These were in the old setup, you can ignore or create stubs
src/components/voice/WelcomeLanding.tsx
src/components/voice/VoiceSessionProvider.tsx
```

**Fix**: Use Option 1 above, or delete references to these files.

### Issue 2: CSS Not Loading

Make sure you're using the right CSS file:
- Trainco uses: `src/index.css`
- Next.js default: `src/app/globals.css`

**Fix**: Import `@/index.css` in your layout.

### Issue 3: "use client" Errors

Trainco components use hooks and need `'use client'` directive in Next.js.

**Fix**: Add `'use client'` at the top of any page using trainco components.

### Issue 4: Environment Variables

Next.js requires `NEXT_PUBLIC_` prefix for client-side env vars.

**Fix**: Rename any `VITE_` vars to `NEXT_PUBLIC_` in your code.

---

## Recommended: Option 1 Setup

For the full trainco experience with voice AI, job search, and all features, use **Option 1**.

The trainco app includes:
- ✅ Voice AI interaction
- ✅ Job search and applications
- ✅ Career growth tracking
- ✅ Learning paths
- ✅ Employer dashboard
- ✅ Profile management
- ✅ Skills assessment

---

## Testing Checklist

After setup, test these features:

- [ ] App loads without errors
- [ ] Voice interaction works (needs mic permission)
- [ ] Job search displays
- [ ] Dashboard navigation works
- [ ] Profile page loads
- [ ] Charts render correctly

---

## Need Help?

Check these files for reference:
- `TRAINCO_IMPORT_COMPLETE.md` - Full import documentation
- `INTEGRATION_COMPLETE.md` - DSL card system guide
- `TRAINCO_COMPONENTS.md` - Component reference

---

**Quick Start**: Follow Option 1 steps above for the fastest path to a working app! 🚀
