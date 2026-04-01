# Direct UI Approach - No navigateToSection Needed

## What Changed

We removed the `navigateToSection` function entirely and simplified the architecture so site functions return UI data directly to the Show LLM.

## New Architecture

```
User speaks → Mobeus Agent (Speak LLM) → Calls site function → Returns UI data → Show LLM renders UI
```

### Before (Complex)
```javascript
// Site function returned payload
{ badge: "...", title: "...", generativeSubsections: [...] }

// Agent had to call navigateToSection with this payload
navigateToSection(badge, title, subtitle, generativeSubsections)

// Problem: navigateToSection was being called via wrong path
```

### After (Simple)
```javascript
// Site function returns UI data directly
{
  success: true,
  badge: "MOBEUS CAREER",
  title: "Welcome",
  subtitle: "Getting started",
  type: "GlassmorphicOptions",
  bubbles: [
    { label: "Yes, I'm ready" },
    { label: "Not just yet" },
    { label: "Tell me more" }
  ]
}

// Show LLM receives this and renders the UI automatically
// No intermediate navigateToSection call needed
```

## Files Changed

### 1. Site Functions (`src/site-functions/*.ts`)
- All 19 journey functions now return flat UI data
- No more `generativeSubsections` nesting
- Direct `bubbles` array instead of `props.bubbles`

Example:
```typescript
export default function journeyWelcomeGreeting() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Welcome',
    subtitle: 'Getting started',
    type: 'GlassmorphicOptions',
    bubbles: [
      { label: "Yes, I'm ready" },
      { label: "Not just yet" },
      { label: "Tell me more" },
    ],
  });
}
```

### 2. Helper (`src/site-functions/helpers.ts`)
- New `uiResponse()` function replaces `navigationResponse()`
- Returns flat structure with `type` and `bubbles` at top level

### 3. Layout (`src/app/layout.tsx`)
- Removed all `navigateToSection` proxy logic
- Simplified to just initialize `window.__siteFunctions`

### 4. Register (`src/site-functions/register.ts`)
- Removed `navigateToSection` import and registration
- Now only registers actual site functions (20 total)

### 5. Prompts
- **Show LLM** (`public/prompts/show-llm-welcome-journey.md`): Updated to expect structured JSON instead of pipe-delimited strings
- **Speak LLM** (`public/prompts/DIRECT_SPEAK_PROMPT.md`): New simplified prompt that just calls site functions directly

## How to Use

### 1. Update Speak LLM Prompt in Mobeus Dashboard

Go to https://app.mobeus.ai and paste the content from:
```
public/prompts/DIRECT_SPEAK_PROMPT.md
```

This prompt simply calls site functions:
```
STEP 1 — GREETING
Speech: "Welcome! Are you ready to start your journey?"
Action: Call `journeyWelcomeGreeting` site function.
```

### 2. Update Show LLM Prompt in Mobeus Dashboard

Paste the content from:
```
public/prompts/show-llm-welcome-journey.md
```

This prompt knows how to render the structured JSON from site functions.

### 3. Test

1. Go to https://train-v1.rapidprototype.ai/v2
2. Hard refresh (Cmd + Shift + R or Ctrl + Shift + R)
3. Start conversation
4. Bubbles should appear automatically

## Benefits

1. **Simpler**: No proxy functions, no complex routing
2. **Cleaner**: Site functions just return data
3. **Direct**: Show LLM gets data directly from site functions
4. **No SDK Issues**: Not trying to call internal SDK functions via RPC

## Site Functions Available

All 20 site functions are registered:
- `setTheme`
- `journeyWelcomeGreeting`
- `journeyWelcomeTellmore`
- `journeyWelcomeIndustry`
- `journeyWelcomeIndustryCustom`
- `journeyWelcomeExploration`
- `journeyWelcomeRoleTechnology`
- `journeyWelcomeRoleFinance`
- `journeyWelcomeRoleHealthcare`
- `journeyWelcomeRoleConstruction`
- `journeyWelcomeRoleCustomIndustry`
- `journeyWelcomeRoleGeneric`
- `journeyWelcomeRoleCustomInput`
- `journeyWelcomeInterestTechnology`
- `journeyWelcomeInterestFinance`
- `journeyWelcomeInterestHealthcare`
- `journeyWelcomeInterestConstruction`
- `journeyWelcomePriority`
- `journeyWelcomePriorityCustom`
- `journeyWelcomeRegistration`

## Deployment

Deployed to AWS ECS:
- Image: `222308823987.dkr.ecr.eu-west-1.amazonaws.com/trainco/dev/train-co-site:latest`
- URL: https://train-v1.rapidprototype.ai/v2

## Next Steps

1. Update Speak LLM prompt in Mobeus dashboard
2. Update Show LLM prompt in Mobeus dashboard
3. Hard refresh browser
4. Test the welcome journey
