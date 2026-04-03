# Mobeus Site Functions Registration Guide

## Overview

You need to register 3 site functions in the Mobeus dashboard for agent ID: `f0181b10-6d3d-4810-956c-1a3eef93653d`

## Files Created

I've created the following files with the function definitions:

1. **`MOBEUS_SITE_FUNCTIONS_REGISTRATION.json`** - All 3 functions in one file
2. **`mobeus-functions/setTheme.json`** - Individual function definition
3. **`mobeus-functions/navigateToSection.json`** - Individual function definition  
4. **`mobeus-functions/navigateWithKnowledgeKey.json`** - Individual function definition

---

## Method 1: Using Mobeus Dashboard UI

### Step 1: Access the Dashboard

1. Go to: https://app.mobeus.ai
2. Log in with your credentials
3. Navigate to your agent: `f0181b10-6d3d-4810-956c-1a3eef93653d`

### Step 2: Find Site Functions Section

Look for one of these sections in the dashboard:
- **"Site Functions"**
- **"Custom Tools"**
- **"External Functions"**
- **"RPC Functions"**
- **"Tool Registry"**
- **"Function Definitions"**

### Step 3: Register Each Function

For each of the 3 functions, you'll need to provide:

#### Function 1: setTheme

**Copy this JSON:**
```json
{
  "name": "setTheme",
  "description": "Switch the website theme between light, dark, or system preference",
  "parameters": {
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

#### Function 2: navigateToSection

**Copy this JSON:**
```json
{
  "name": "navigateToSection",
  "description": "Update the UI with a navigation payload. Receives badge, title, subtitle, and generativeSubsections.",
  "parameters": {
    "type": "object",
    "properties": {
      "badge": {
        "type": "string",
        "description": "Context label (e.g. 'MOBEUS CAREER')"
      },
      "title": {
        "type": "string",
        "description": "Main heading"
      },
      "subtitle": {
        "type": "string",
        "description": "Subheading"
      },
      "generativeSubsections": {
        "type": "array",
        "description": "Screen sections with templateId and props"
      }
    },
    "required": ["badge", "title", "subtitle", "generativeSubsections"]
  }
}
```

#### Function 3: navigateWithKnowledgeKey (MOST IMPORTANT)

**Copy this JSON:**
```json
{
  "name": "navigateWithKnowledgeKey",
  "description": "Load a static screen from the knowledge base by key. Use this for all welcome journey steps.",
  "parameters": {
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

---

## Method 2: Using Mobeus API (If Available)

If Mobeus provides an API endpoint for registering site functions:

### Option A: Register All at Once

```bash
curl -X POST https://app.mobeus.ai/api/v1/agents/f0181b10-6d3d-4810-956c-1a3eef93653d/site-functions \
  -H "Authorization: Bearer YOUR_MOBEUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d @MOBEUS_SITE_FUNCTIONS_REGISTRATION.json
```

### Option B: Register Individually

```bash
# Register setTheme
curl -X POST https://app.mobeus.ai/api/v1/agents/f0181b10-6d3d-4810-956c-1a3eef93653d/site-functions \
  -H "Authorization: Bearer YOUR_MOBEUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mobeus-functions/setTheme.json

# Register navigateToSection
curl -X POST https://app.mobeus.ai/api/v1/agents/f0181b10-6d3d-4810-956c-1a3eef93653d/site-functions \
  -H "Authorization: Bearer YOUR_MOBEUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mobeus-functions/navigateToSection.json

# Register navigateWithKnowledgeKey
curl -X POST https://app.mobeus.ai/api/v1/agents/f0181b10-6d3d-4810-956c-1a3eef93653d/site-functions \
  -H "Authorization: Bearer YOUR_MOBEUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d @mobeus-functions/navigateWithKnowledgeKey.json
```

**Note:** Replace `YOUR_MOBEUS_API_KEY` with your actual API key. The exact API endpoint URL may differ - check Mobeus documentation.

---

## Method 3: Contact Mobeus Support

If you can't find where to register site functions in the dashboard or API:

### Email Template:

```
Subject: How to Register Custom Site Functions for Agent

Hi Mobeus Support,

I need to register 3 custom site functions for my agent:
- Agent ID: f0181b10-6d3d-4810-956c-1a3eef93653d
- Functions: setTheme, navigateToSection, navigateWithKnowledgeKey

I have the function definitions ready (JSON schemas), but I can't find where 
to register them in the dashboard. The agent's tool cache shows "count: 0" 
even though the functions are registered client-side.

Could you please:
1. Point me to where I can register these functions in the dashboard, OR
2. Register them for me using the attached JSON definitions, OR
3. Provide API documentation for programmatic registration

Thank you!
```

Attach: `MOBEUS_SITE_FUNCTIONS_REGISTRATION.json`

---

## Verification After Registration

### Step 1: Clear Cache and Reload

1. Clear browser cache (Cmd+Shift+Delete)
2. Open https://train-v1.rapidprototype.ai/v2 in incognito
3. Open browser console (F12)

### Step 2: Check Console Logs

You should now see:

```
[ToolsService] Rebuilt tool cache from backend: {count: 3, tools: Array(3)}
[UIFramework] Site function registry already up to date (tenant-system-init)
```

**Before registration you saw:**
```
[ToolsService] Rebuilt tool cache from backend: {count: 0, tools: Array(0)}
```

### Step 3: Test the Welcome Journey

1. Start the voice session
2. Agent should immediately say: "Welcome! Are you ready to start your journey?"
3. You should see 3 glassmorphic bubbles appear:
   - "Yes, I'm ready"
   - "Not just yet"
   - "Tell me more"

---

## Troubleshooting

### If count is still 0:

1. **Refresh the dashboard** - Changes may need a page reload
2. **Check agent ID** - Make sure you're updating the correct agent
3. **Wait a few minutes** - Mobeus may need time to propagate changes
4. **Check API key** - Ensure your deployed site uses the correct Mobeus API key
5. **Contact support** - If nothing works, Mobeus support can help

### If functions are registered but bubbles don't appear:

1. **Update the system prompt** - See `public/prompts/speak-llm-system-prompt.md`
2. **Check prompt ID** - Make sure you updated prompt `0f05159f-0f1a-4935-84a4-24df154bf7f9`
3. **Clear Mobeus cache** - Log out and back in to the dashboard

---

## Summary

**You need to:**
1. ✅ Register 3 site functions in Mobeus dashboard (use JSON files I created)
2. ✅ Update system prompt in Mobeus dashboard (use `speak-llm-system-prompt.md`)
3. ✅ Test and verify

**Your code is ready. The deployment is working. This is the final step!**
