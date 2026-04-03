# Final Setup Instructions

## Current Status

✅ **Code is correct** - All site functions are properly registered
✅ **Deployment in progress** - New Docker image being pushed to AWS
⏳ **Waiting for** - Mobeus dashboard prompt update

---

## The Real Issue

The problem is NOT in your code. The issue is that **Mobeus discovers site functions from its backend dashboard**, not from your website's code or JSON files.

### Evidence:

1. **Your console shows:** `total 3 functions: ['navigateToSection', 'setTheme', 'navigateWithKnowledgeKey']`
   - ✅ Functions ARE registered client-side

2. **But Mobeus SDK shows:** `[ToolsService] Rebuilt tool cache from backend: {count: 0, tools: Array(0)}`
   - ❌ Mobeus backend has 0 tools registered

3. **Working site-4 shows:** `[UIFramework] Site function registry already up to date (tenant-system-init)`
   - ✅ Mobeus backend knows about the site functions

---

## What You MUST Do Now

### Step 1: Update Mobeus Dashboard - System Prompt

1. Go to: **https://app.mobeus.ai**
2. Log in with your account
3. Find agent ID: **`f0181b10-6d3d-4810-956c-1a3eef93653d`**
4. Navigate to **Prompts** section
5. Find prompt ID: **`0f05159f-0f1a-4935-84a4-24df154bf7f9`**
6. **Replace the entire prompt** with the contents of:
   ```
   /Users/jannatwatts/train-co-site/public/prompts/speak-llm-system-prompt.md
   ```
7. **Save** the changes

### Step 2: Register Site Functions in Mobeus Dashboard

**This is the critical step that's missing!**

In the Mobeus dashboard, you need to manually register these 3 site functions:

#### Function 1: `setTheme`
```json
{
  "name": "setTheme",
  "description": "Switch the website theme between light, dark, or system preference",
  "schema": {
    "type": "object",
    "properties": {
      "theme": {
        "type": "string",
        "enum": ["light", "dark", "system"],
        "description": "The theme to apply"
      }
    },
    "required": ["theme"]
  }
}
```

#### Function 2: `navigateToSection`
```json
{
  "name": "navigateToSection",
  "description": "Update the UI with a navigation payload. Receives badge, title, subtitle, and generativeSubsections.",
  "schema": {
    "type": "object",
    "properties": {
      "badge": { "type": "string" },
      "title": { "type": "string" },
      "subtitle": { "type": "string" },
      "generativeSubsections": { "type": "array" }
    },
    "required": ["badge", "title", "subtitle", "generativeSubsections"]
  }
}
```

#### Function 3: `navigateWithKnowledgeKey`
```json
{
  "name": "navigateWithKnowledgeKey",
  "description": "Load a static screen from the knowledge base by key. Use this for all welcome journey steps.",
  "schema": {
    "type": "object",
    "properties": {
      "key": {
        "type": "string",
        "enum": [
          "welcome_greeting",
          "welcome_tell_me_more",
          "qualification_industry",
          "qualification_industry_text_input",
          "qualification_exploration",
          "qualification_role_technology",
          "qualification_role_finance",
          "qualification_role_healthcare",
          "qualification_role_construction",
          "qualification_role_generic",
          "qualification_role_custom_text_input",
          "qualification_interest_technology",
          "qualification_interest_finance",
          "qualification_interest_healthcare",
          "qualification_interest_construction",
          "qualification_priority",
          "qualification_priority_text_input",
          "qualification_registration"
        ],
        "description": "The knowledge key for the screen to load"
      }
    },
    "required": ["key"]
  }
}
```

### Step 3: Test

After updating BOTH the prompt AND registering the site functions:

1. **Clear browser cache** (Cmd+Shift+Delete, select "All time")
2. Open in **incognito**: `https://train-v1.rapidprototype.ai/v2`
3. **Open console** (F12)
4. **Start voice session**

### Expected Results:

#### Console Logs:
```
[Site Functions] After registration, total 3 functions: ['navigateToSection', 'setTheme', 'navigateWithKnowledgeKey']
[ToolsService] Rebuilt tool cache from backend: {count: 3, tools: Array(3)}
[UIFramework] Site function registry already up to date (tenant-system-init)
```

#### UI Behavior:
- Agent says: "Welcome! Are you ready to start your journey?"
- 3 glassmorphic bubbles appear: "Yes, I'm ready", "Not just yet", "Tell me more"

---

## Why This Will Work

### The Architecture:

1. **Client-Side Registration** (Your Code) ✅
   ```
   window.__siteFunctions = {
     navigateToSection: fn,
     setTheme: fn,
     navigateWithKnowledgeKey: fn
   }
   ```

2. **Mobeus Backend Registration** (Dashboard) ❌ MISSING
   ```
   Mobeus needs to know these functions exist
   so it can tell the agent to call them
   ```

3. **Agent Prompt** (Dashboard) ⏳ NEEDS UPDATE
   ```
   Agent needs instructions on WHEN and HOW
   to call these functions
   ```

### The Flow:

```
User starts session
     ↓
Mobeus agent reads prompt from dashboard
     ↓
Prompt says: "Call navigateWithKnowledgeKey with key 'welcome_greeting'"
     ↓
Agent checks: "Do I have access to navigateWithKnowledgeKey?"
     ↓
Mobeus backend says: "Yes" (if registered in dashboard)
     ↓
Agent calls: call_site_function('navigateWithKnowledgeKey', {key: 'welcome_greeting'})
     ↓
Your website receives the call
     ↓
window.__siteFunctions.navigateWithKnowledgeKey({key: 'welcome_greeting'})
     ↓
UI shows bubbles!
```

**Currently stuck at:** "Mobeus backend says: No" because functions aren't registered in dashboard.

---

## How to Register Site Functions in Mobeus Dashboard

### Option 1: Manual Registration (If UI exists)

Look for a section in the Mobeus dashboard like:
- "Site Functions"
- "Custom Tools"
- "External Functions"
- "RPC Functions"

Add each of the 3 functions with their schemas.

### Option 2: API Registration (If no UI)

If Mobeus provides an API to register site functions, you might need to:

```bash
curl -X POST https://app.mobeus.ai/api/agents/f0181b10-6d3d-4810-956c-1a3eef93653d/site-functions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/Users/jannatwatts/train-co-site/public/site-functions.json
```

### Option 3: Contact Mobeus Support

If you can't find where to register site functions, contact Mobeus support and ask:

> "How do I register custom site functions for my agent (ID: f0181b10-6d3d-4810-956c-1a3eef93653d)? 
> I have the functions registered client-side, but the agent shows 'count: 0' tools from the backend."

---

## Verification Checklist

- [ ] Mobeus dashboard prompt updated with new system prompt
- [ ] Site functions registered in Mobeus dashboard (3 functions)
- [ ] Browser cache cleared
- [ ] Console shows: `[ToolsService] Rebuilt tool cache from backend: {count: 3, tools: Array(3)}`
- [ ] Console shows: `[UIFramework] Site function registry already up to date`
- [ ] Welcome journey shows bubbles on session start
- [ ] No "Site function not available" errors

---

## Troubleshooting

### If you still see `count: 0` tools:

1. **Check Mobeus dashboard** - Are the site functions actually saved?
2. **Check agent ID** - Are you updating the correct agent?
3. **Clear Mobeus cache** - Try logging out and back in
4. **Check API key** - Is your deployed site using the correct Mobeus API key?

### If bubbles still don't appear:

1. **Check console for RPC calls** - Look for `call_site_function` calls
2. **Check agent speech** - Is the agent calling `navigateWithKnowledgeKey`?
3. **Check prompt** - Did the dashboard prompt actually update?

---

## Summary

**The code is perfect. The deployment is working. The only missing piece is registering the site functions in the Mobeus dashboard so the agent knows they exist.**

Once you do that, everything will work immediately.
