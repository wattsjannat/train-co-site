# Deployment Fixes - April 2, 2026

## What Was Fixed

### 1. **Critical Fix: `navigateToSection` Registration**

**Problem:** The `navigateToSection` site function was not being properly registered, causing the Mobeus agent to report "Site function 'navigateToSection' is not available".

**Root Cause:** Your `usePhaseFlow` hook was only patching `window.UIFrameworkSiteFunctions.navigateToSection` but NOT `window.__siteFunctions.navigateToSection`. The working `trainco-site-4` patches BOTH.

**Fix Applied:**
- Updated `src/hooks/usePhaseFlow.ts` (lines 823-836) to patch BOTH objects:
  ```typescript
  w.UIFrameworkSiteFunctions ??= {};
  w.UIFrameworkSiteFunctions.navigateToSection = navigateToSection;

  w.__siteFunctions ??= {};
  w.__siteFunctions.navigateToSection = navigateToSection;
  ```

- Added `navigateToSection` back to `src/site-functions/register.ts` manifest (with proper schema)
- Added `navigateToSection` back to `public/site-functions.json` for Mobeus discovery
- Simplified `src/app/layout.tsx` inline script to only initialize the object (removed duplicate registration)

### 2. **Updated Speak LLM Prompts**

**Files Updated:**
- `public/prompts/speak-llm-system-prompt.md` - Full system prompt from working repo
- `public/prompts/speak-llm-welcome-journey.md` - Welcome journey prompt

**Key Changes:**
- Added detailed instructions on MCP tool usage and JSON argument passing
- Added "Hard gate" section explaining why "couldn't parse the arguments JSON" errors occur
- Added explicit instructions to use `navigateWithKnowledgeKey` for static screens
- Added HARD STOP rules to prevent agent from advancing without user signals

### 3. **Deployed to AWS**

**Deployment Details:**
- Image: `222308823987.dkr.ecr.eu-west-1.amazonaws.com/trainco/dev/train-co-site:latest`
- Cluster: `trainco-dev`
- Service: `trainco-dev-train-co-site`
- URL: `https://train-v1.rapidprototype.ai/v2`

---

## What You Need to Do Next

### 1. **Update Mobeus Dashboard Prompts** (CRITICAL)

The code changes are deployed, but the Mobeus agent still uses the OLD prompt from the dashboard. You MUST:

1. Go to your Mobeus dashboard for this agent
2. Navigate to the "Speak LLM" prompt configuration
3. Copy the ENTIRE contents of `public/prompts/speak-llm-system-prompt.md`
4. Paste it into the Mobeus dashboard's Speak LLM prompt field
5. Save the changes

**Without this step, the agent will NOT call site functions correctly, even though they're now registered.**

### 2. **Test the Welcome Journey**

After updating the Mobeus prompt:

1. Clear browser cache (hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Open `https://train-v1.rapidprototype.ai/v2` in an incognito window
3. Start the voice session
4. The agent should immediately:
   - Say "Welcome! Are you ready to start your journey?"
   - Show 3 glassmorphic bubbles: "Yes, I'm ready", "Not just yet", "Tell me more"

**Expected Console Logs:**
```
[Site Functions v8] Initializing __siteFunctions object early
[Site Functions v8] Initial functions: []
[Site Functions] registerSiteFunctions called at: [timestamp]
[Site Functions] After registration, total 3 functions: ["navigateToSection", "setTheme", "navigateWithKnowledgeKey"]
[Site Functions] navigateToSection type: function
```

### 3. **Fix the MCP Tool Calling Issue** (If jobs still don't load)

**Current Problem:** Your frontend is trying to call `/api/invoke/get_jobs_by_skills` which fails because:
- It's a static export (no API routes)
- CORS blocks the fallback to `train-v1.rapidprototype.ai`

**Correct Architecture (per working repo):**
- The **Mobeus agent** (backend) should call MCP tools directly via its own MCP connection
- The agent passes results to the frontend via `navigateToSection` props using `rawJobsJson`, `rawCandidateJson`, etc.
- The frontend should NEVER try to fetch these via HTTP

**To Fix:**
1. Ensure your Mobeus agent has MCP tools configured (`get_jobs_by_skills`, `get_candidate`, etc.)
2. Update the agent prompt to call these tools and pass results via `navigateToSection` props
3. The frontend will automatically use the data from props (no HTTP calls needed)

---

## Architecture Summary

### Site Function Registration Flow

1. **Early Init** (`layout.tsx` inline script):
   ```javascript
   window.__siteFunctions = {};
   ```

2. **usePhaseFlow Hook** (runs when App.tsx mounts):
   ```typescript
   window.UIFrameworkSiteFunctions.navigateToSection = navigateToSection;
   window.__siteFunctions.navigateToSection = navigateToSection;
   ```

3. **registerSiteFunctions** (runs after usePhaseFlow):
   ```typescript
   // Skips navigateToSection because it's already registered
   window.__siteFunctions.setTheme = setTheme;
   window.__siteFunctions.navigateWithKnowledgeKey = navigateWithKnowledgeKey;
   ```

### Mobeus Agent → Frontend Flow

1. **User Action** → TellTele signal sent to agent
2. **Agent** calls MCP tools (e.g., `get_jobs_by_skills`)
3. **Agent** calls `call_site_function` with `navigateToSection` and full payload including `rawJobsJson`
4. **Frontend** receives payload, parses `rawJobsJson`, updates UI

---

## Files Changed

### Core Fixes
- `src/hooks/usePhaseFlow.ts` - Added `window.__siteFunctions.navigateToSection` registration
- `src/site-functions/register.ts` - Added `navigateToSection` to manifest
- `public/site-functions.json` - Added `navigateToSection` schema
- `src/app/layout.tsx` - Simplified inline script

### Prompts
- `public/prompts/speak-llm-system-prompt.md` - Full system prompt
- `public/prompts/speak-llm-welcome-journey.md` - Welcome journey prompt

---

## Verification Checklist

- [x] Code changes deployed to AWS
- [ ] Mobeus dashboard prompt updated with new system prompt
- [ ] Browser cache cleared
- [ ] Welcome journey shows bubbles on session start
- [ ] Agent calls `navigateWithKnowledgeKey` successfully
- [ ] No "Site function not available" errors in console
- [ ] Jobs load correctly (if MCP tools are configured)

---

## Next Steps for `/v1` Routing

You asked about routing `https://train-v1.rapidprototype.ai/v1` to `https://qm25v8m4.sites.mobeus.ai`.

This requires adding an ALB listener rule in your `trainco-v1` Terraform configuration. See the separate routing guide for details.

Current setup:
- `/v2` → Your `train-co-site` (this deployment)
- `/v1` → Not yet configured (needs Terraform change)

---

## Troubleshooting

### If bubbles still don't appear:

1. **Check console for registration logs:**
   ```
   [Site Functions v8] After registration, total 3 functions: ["navigateToSection", "setTheme", "navigateWithKnowledgeKey"]
   ```

2. **Check for Mobeus SDK errors:**
   ```
   [UIFramework] Site function "navigateToSection" is not available
   ```
   If you see this, the Mobeus dashboard prompt is still outdated.

3. **Check network tab:**
   - Look for `call_site_function` RPC calls
   - Verify the agent is calling `navigateWithKnowledgeKey` with key `welcome_greeting`

4. **Check Mobeus agent logs:**
   - Verify the agent received the updated prompt
   - Check if the agent is calling the site functions

### If jobs don't load:

1. **Check console for MCP errors:**
   ```
   POST http://localhost:3000/api/invoke/get_jobs_by_skills 404 (Not Found)
   ```
   This means the frontend is trying to call MCP tools directly (wrong architecture).

2. **Verify agent MCP configuration:**
   - Ensure `get_jobs_by_skills`, `get_candidate`, etc. are configured in Mobeus
   - Check agent logs to see if it's calling these tools

3. **Check navigateToSection payloads:**
   - The agent should pass `rawJobsJson` in the props
   - The frontend should NOT make HTTP calls to `/api/invoke/*`

---

## Summary

The critical fix was ensuring `navigateToSection` is registered on BOTH `window.UIFrameworkSiteFunctions` AND `window.__siteFunctions`. This matches the working `trainco-site-4` pattern.

The deployment is complete, but you MUST update the Mobeus dashboard prompt for the agent to use the new instructions.
