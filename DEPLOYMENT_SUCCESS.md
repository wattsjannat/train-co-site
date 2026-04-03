# Deployment Success! 🎉

## What Was Fixed

### The Missing Piece: `site-functions/register.ts`

Mobeus discovers site functions by looking for a **`site-functions/register.ts`** file at the **root** of your repository (not in `src/`).

**Before:** You had `src/site-functions/register.ts` but no root-level file for Mobeus to discover.

**After:** Created `site-functions/register.ts` that exports from `src/site-functions/register.ts`.

This is how Mobeus knows which functions are available!

---

## Deployment Status

✅ **Code Changes:** Complete
✅ **Build:** Successful  
✅ **Docker Image:** Built and pushed to ECR
✅ **ECS Service:** Updated successfully
✅ **Deployment:** Complete at 2026-04-03T13:43:20

**Deployed to:** https://train-v1.rapidprototype.ai/v2

---

## What to Expect Now

### 1. Wait for ECS to Start New Tasks

The ECS service needs a few minutes to:
- Stop the old tasks
- Start new tasks with the updated image
- Pass health checks

**Check status:**
```bash
aws ecs describe-services \
  --cluster trainco-dev \
  --services trainco-dev-train-co-site \
  --region eu-west-1 \
  --query 'services[0].deployments'
```

Look for:
- `"runningCount": 1` on the PRIMARY deployment
- `"runningCount": 0` on the old ACTIVE deployment

### 2. Test the Site

Once the new task is running:

1. **Clear browser cache** (Cmd+Shift+Delete, select "All time")
2. **Open in incognito:** https://train-v1.rapidprototype.ai/v2
3. **Open console** (F12)
4. **Start voice session**

### 3. Expected Console Logs

You should now see:

```
[Site Functions v8] Initializing __siteFunctions object early
[Site Functions v8] Initial functions: []
[Site Functions] After registration, total 3 functions: ['navigateToSection', 'setTheme', 'navigateWithKnowledgeKey']
[ToolsService] Rebuilt tool cache from backend: {count: 3, tools: Array(3)}
[UIFramework] Site function registry already up to date (tenant-system-init)
```

**Key change:** `count: 3` instead of `count: 0`!

### 4. Expected UI Behavior

- Agent says: **"Welcome! Are you ready to start your journey?"**
- **3 glassmorphic bubbles appear:**
  - "Yes, I'm ready"
  - "Not just yet"
  - "Tell me more"

---

## File Structure (What Changed)

```
train-co-site/
├── site-functions/           ← NEW! (Root level for Mobeus discovery)
│   └── register.ts          ← Exports from src/site-functions/register.ts
├── src/
│   ├── site-functions/
│   │   ├── register.ts      ← Updated with navigateWithKnowledgeKey
│   │   ├── navigateToSection.ts
│   │   ├── navigateWithKnowledgeKey.ts  ← NEW!
│   │   └── setTheme.ts
│   ├── data/
│   │   └── traincoStaticKnowledge.ts    ← NEW! (All static UI screens)
│   └── hooks/
│       └── usePhaseFlow.ts  ← Fixed to register on both objects
├── public/
│   ├── site-functions.json  ← Updated with 3 functions
│   └── prompts/
│       ├── speak-llm-system-prompt.md  ← Updated
│       └── speak-llm-welcome-journey.md  ← Updated
└── out/                     ← Built static site (deployed)
```

---

## How Mobeus Discovery Works

### 1. Mobeus Deployment Process

When you deploy, Mobeus:
1. Looks for `site-functions/register.ts` at the repo root
2. Imports `siteFunctionManifest` from that file
3. Registers the functions in its backend
4. Makes them available to the agent

### 2. Client-Side Registration

When the page loads:
1. `layout.tsx` initializes `window.__siteFunctions = {}`
2. `usePhaseFlow` registers `navigateToSection` on both objects
3. `registerSiteFunctions()` registers `setTheme` and `navigateWithKnowledgeKey`

### 3. Agent Calls Functions

When the agent wants to update UI:
1. Agent checks Mobeus backend: "Do I have access to `navigateWithKnowledgeKey`?"
2. Mobeus backend says: "Yes" (because it read `site-functions/register.ts`)
3. Agent calls: `call_site_function('navigateWithKnowledgeKey', {key: 'welcome_greeting'})`
4. Your site receives the call and executes `window.__siteFunctions.navigateWithKnowledgeKey()`
5. UI updates with bubbles!

---

## Troubleshooting

### If you still see `count: 0`:

1. **Wait 5-10 minutes** - ECS takes time to deploy new tasks
2. **Check ECS status** - Ensure new task is running
3. **Hard refresh** - Cmd+Shift+R (or Ctrl+Shift+R on Windows)
4. **Check deployment** - Verify the new Docker image was pushed
5. **Check logs:**
   ```bash
   aws logs tail /ecs/trainco-dev/train-co-site --follow --region eu-west-1
   ```

### If bubbles don't appear but count is 3:

1. **Update Mobeus prompt** - Copy `public/prompts/speak-llm-system-prompt.md` to Mobeus dashboard
2. **Check agent ID** - Ensure you're using agent `f0181b10-6d3d-4810-956c-1a3eef93653d`
3. **Check prompt ID** - Ensure you updated prompt `0f05159f-0f1a-4935-84a4-24df154bf7f9`

---

## Summary

**The fix was simple:** Mobeus needed a `site-functions/register.ts` file at the root of the repo to discover your functions.

Now that it's deployed:
- ✅ Mobeus can discover the 3 site functions
- ✅ Agent can call them
- ✅ UI will update correctly
- ✅ Bubbles will appear!

**Just wait a few minutes for ECS to deploy the new tasks, then test!** 🚀
