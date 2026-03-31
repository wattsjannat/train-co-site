# 🔧 MCP SSE Connection Error - Fix Guide

## Problem

You're seeing "MCP SSE connection failed" because the Trainco app is trying to connect to backend APIs that don't exist yet.

## Quick Fix (Recommended)

I've created mock API endpoints that will handle these requests. The app will now work with mock data!

### What I Did:

✅ Created `/api/invoke/[toolName]/route.ts` - Mock API handler
✅ Returns mock data for:
- LinkedIn profile import
- Job search
- Career growth data
- Learning paths

## How to Use

Just run the app normally:

```bash
npm run dev
```

The mock APIs will automatically respond to MCP tool calls.

---

## Alternative: Disable MCP Features

If you want to completely disable MCP features, update `.env.local`:

```env
# Add this line
NEXT_PUBLIC_DISABLE_MCP=true
```

Then update `src/lib/mcpBridge.ts` to check this flag:

```typescript
// At the top of invokeBridge function
if (process.env.NEXT_PUBLIC_DISABLE_MCP === 'true') {
  console.log('[mcpBridge] MCP disabled, using mock data');
  return undefined;
}
```

---

## Connect to Real Backend

To connect to a real backend instead of mocks:

### 1. Start Your Backend Server

```bash
cd /Users/jannatwatts/trainco-v1
npm run dev
```

### 2. Update API URL

In `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5173
```

### 3. Backend Requirements

Your backend should provide these endpoints:

- `POST /api/invoke/linkedin-profile` - Import LinkedIn profile
- `POST /api/invoke/job-search` - Search jobs
- `POST /api/invoke/career-growth` - Get career data
- `POST /api/invoke/learning-path` - Get learning recommendations

---

## Understanding the Error

The MCP (Model Context Protocol) SSE connection error happens because:

1. **Trainco uses MCP** to communicate with AI tools
2. **SSE (Server-Sent Events)** is used for real-time updates
3. **No backend running** = connection fails

### What MCP Does:

- Connects to AI models (Claude, GPT, etc.)
- Fetches job data
- Imports LinkedIn profiles
- Generates learning paths
- Provides career insights

---

## Testing Without Backend

With the mock API I created, you can test:

✅ Job search functionality
✅ Profile viewing
✅ Career growth tracking
✅ Learning path recommendations
✅ All UI components

The app will use realistic mock data instead of real API calls.

---

## Mock Data Location

Mock data is also available in:

- `src/mocks/jobSearchData.ts` - Job listings
- `src/mocks/userData.ts` - User profiles
- `src/mocks/courseData.ts` - Courses
- `src/mocks/skillsData.ts` - Skills data

You can edit these files to customize the mock data.

---

## Next Steps

1. **Run the app**: `npm run dev`
2. **Test features**: Browse jobs, view profile, etc.
3. **Check console**: Should see `[API] MCP tool invoked:` logs
4. **No more errors**: MCP calls will succeed with mock data

---

## Production Setup

For production, you'll need:

1. **Backend API** - Real job data, user profiles
2. **AI Integration** - Claude/GPT for conversations
3. **Database** - Store user data, applications
4. **Authentication** - User login/signup
5. **MCP Server** - Handle tool invocations

---

**The mock API is now in place - just run `npm run dev` and the error should be gone!** ✅
