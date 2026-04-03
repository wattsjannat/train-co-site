# Quick Registration Guide

## Option 1: Try Automated Script (May Not Work)

I created a script that attempts to register the functions via API, but it may not work if Mobeus doesn't support API registration.

### Try it:

```bash
cd /Users/jannatwatts/train-co-site

# Set your Mobeus API key (the one you use for deployment)
export MOBEUS_API_KEY="vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30"

# Run the script
./register-mobeus-functions.sh
```

**If it works:** You'll see green checkmarks and the functions will be registered.

**If it doesn't work:** You'll see 404 errors. This means Mobeus requires manual dashboard registration (see Option 2).

---

## Option 2: Manual Dashboard Registration (MOST RELIABLE)

This is the guaranteed way to register the functions.

### Step 1: Go to Mobeus Dashboard

1. Open: https://app.mobeus.ai
2. Log in
3. Find your agent: `f0181b10-6d3d-4810-956c-1a3eef93653d`

### Step 2: Find Site Functions Section

Look for:
- "Site Functions"
- "Custom Tools"  
- "External Functions"
- "Tool Registry"

### Step 3: Add These 3 Functions

Open these files and copy-paste the JSON into the dashboard:

1. **`mobeus-functions/setTheme.json`**
2. **`mobeus-functions/navigateToSection.json`**
3. **`mobeus-functions/navigateWithKnowledgeKey.json`**

Each file has the complete function definition ready to paste.

### Step 4: Verify

After registration, reload your site and check the console:

**Before:** `[ToolsService] Rebuilt tool cache from backend: {count: 0, tools: Array(0)}`

**After:** `[ToolsService] Rebuilt tool cache from backend: {count: 3, tools: Array(3)}`

---

## Option 3: Contact Mobeus Support

If you can't find where to register functions:

**Email:** support@mobeus.ai (or check their website for support contact)

**Subject:** Site Function Registration for Agent f0181b10-6d3d-4810-956c-1a3eef93653d

**Message:**
```
Hi,

I need to register 3 custom site functions for my agent.

Agent ID: f0181b10-6d3d-4810-956c-1a3eef93653d

Functions:
- setTheme
- navigateToSection
- navigateWithKnowledgeKey

I have the JSON definitions ready. Could you please:
1. Tell me where to register them in the dashboard, OR
2. Register them for me using the attached files

Thank you!
```

**Attach:** `MOBEUS_SITE_FUNCTIONS_REGISTRATION.json`

---

## What Happens After Registration?

Once the functions are registered in Mobeus:

1. **Clear browser cache** (Cmd+Shift+Delete)
2. **Open** https://train-v1.rapidprototype.ai/v2 in incognito
3. **Start voice session**
4. **You'll see:**
   - Agent: "Welcome! Are you ready to start your journey?"
   - 3 glassmorphic bubbles appear
   - Everything works!

---

## Why Can't I Do This From Code?

Site function registration happens in the **Mobeus backend**, not in your website code. Your code registers the functions **client-side** (which is working), but Mobeus needs to know about them **server-side** so the agent can call them.

Think of it like this:
- ✅ Your website knows how to handle the functions (done)
- ✅ Your code is deployed (done)
- ❌ Mobeus doesn't know the functions exist yet (needs dashboard registration)

Once you register them in the dashboard, the agent will be able to call them!
