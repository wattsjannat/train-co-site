# Architecture Mismatch Findings

## Date: April 2, 2026

## Problem
The `train-co-site` implementation was not showing glassmorphic bubbles, and `navigateToSection` was throwing "not available" errors, even though the function was registered.

## Root Cause Analysis

After comparing with the working `trainco-site-4` repo, we discovered a **fundamental architectural mismatch**:

### Working Architecture (`trainco-site-4`)
1. **Uses `navigateWithKnowledgeKey` for static screens**
   - Static navigation payloads stored in `src/data/traincoStaticKnowledge.ts`
   - Each payload contains FULL structure: `badge`, `title`, `subtitle`, `generativeSubsections`
   - Agent calls: `navigateWithKnowledgeKey({ key: "welcome_greeting" })`
   - Returns complete navigation payload

2. **Only 3 site functions registered**:
   - `navigateToSection` - receives full payload, updates UI
   - `navigateWithKnowledgeKey` - loads static screen by key
   - `setTheme` - changes theme

3. **Registration pattern**:
   ```typescript
   // Does NOT overwrite existing functions
   if (window.__siteFunctions[name] !== undefined) continue;
   ```

4. **Data flow**:
   ```
   Agent → navigateWithKnowledgeKey("welcome_greeting")
        → Returns: { badge, title, subtitle, generativeSubsections: [...] }
        → SDK's navigateToSection receives full payload
        → UI updates with glassmorphic bubbles
   ```

### Our Broken Architecture (`train-co-site`)
1. **Created 19 individual journey site functions**
   - Each function returns ONLY the bubbles array: `["Option1", "Option2"]`
   - Missing: `badge`, `title`, `subtitle`, `generativeSubsections` structure
   - Agent calls: `journeyWelcomeGreeting()`
   - Returns incomplete data

2. **21 site functions registered** (too many)
   - All 19 journey functions
   - `navigateToSection`
   - `setTheme`

3. **Registration pattern**:
   - Initially was overwriting `navigateToSection`
   - Fixed to match working repo (skip if already exists)

4. **Broken data flow**:
   ```
   Agent → journeyWelcomeGreeting()
        → Returns: { success: true, options: "Yes|No|Maybe" }
        → Agent tries to call navigateToSection separately
        → Missing full payload structure
        → UI doesn't update correctly
   ```

## Key Differences

| Aspect | Working (`trainco-site-4`) | Broken (`train-co-site`) |
|--------|---------------------------|--------------------------|
| **Static screens** | `navigateWithKnowledgeKey` | Individual journey functions |
| **Data format** | Full payload with all fields | Pipe-delimited strings |
| **Number of site functions** | 3 | 21 |
| **Prompt structure** | Single `speak-llm-system-prompt.md` with all journeys | Separate journey files |
| **Agent workflow** | Call one function, get complete payload | Call journey function, then manually build payload |

## Fixes Applied

### 1. Registration Pattern (✅ DEPLOYED)
Updated `register.ts` to match working repo:
```typescript
// Do not overwrite already-installed handlers
if (window.__siteFunctions[name] !== undefined) {
  console.log(`[Site Functions] Skipping ${name} - already registered`);
  continue;
}
```

### 2. Inline Script Enhancement (✅ DEPLOYED)
- Added comprehensive logging
- Ensured `navigateToSection` bridge is registered earliest
- Uses ES5 syntax for maximum compatibility

## What Still Needs to Be Done

### Option A: Refactor to Match Working Architecture (RECOMMENDED)
1. **Create `src/data/traincoStaticKnowledge.ts`**
   - Define all welcome journey screens as complete navigation payloads
   - Example:
     ```typescript
     const WELCOME_GREETING = {
       badge: 'MOBEUS CAREER',
       title: 'Welcome',
       subtitle: 'Getting started',
       generativeSubsections: [{
         id: 'start',
         templateId: 'GlassmorphicOptions',
         props: {
           bubbles: [
             { label: "Yes, I'm ready" },
             { label: 'Not just yet' },
             { label: 'Tell me more' }
           ]
         }
       }]
     };
     ```

2. **Create `navigateWithKnowledgeKey` site function**
   - Looks up key in static knowledge
   - Returns full navigation payload
   - Agent calls this instead of individual journey functions

3. **Update Speak LLM prompt**
   - Consolidate all journey logic into one file
   - Instruct agent to use `navigateWithKnowledgeKey({ key: "welcome_greeting" })`
   - Remove references to individual journey functions

4. **Remove 19 journey site functions**
   - Keep only: `navigateToSection`, `navigateWithKnowledgeKey`, `setTheme`

### Option B: Fix Current Architecture (NOT RECOMMENDED)
1. **Update all journey functions to return full payloads**
   - Each function must return: `{ badge, title, subtitle, generativeSubsections }`
   - Much more code duplication
   - Harder to maintain

2. **Update Speak LLM prompt**
   - Instruct agent to call journey function
   - Journey function returns complete payload
   - Agent passes that to `navigateToSection`

## Recommendation

**Implement Option A** - it matches the proven working architecture and is cleaner:
- Less code duplication
- Easier to maintain static screens
- Follows established pattern
- Only 3 site functions instead of 21

## Current Status

✅ **Deployed fixes**:
- Registration pattern now matches working repo
- `navigateToSection` bridge won't be overwritten
- Enhanced logging for debugging

⚠️ **Still broken**:
- Journey functions return incomplete data
- Agent doesn't have proper instructions
- Missing `navigateWithKnowledgeKey` function
- Missing static knowledge file

## Next Steps

1. Create `src/data/traincoStaticKnowledge.ts` with all journey screens
2. Create `src/site-functions/navigateWithKnowledgeKey.ts`
3. Update `register.ts` to include `navigateWithKnowledgeKey`
4. Remove all 19 journey functions
5. Update Speak LLM prompt to use `navigateWithKnowledgeKey`
6. Deploy and test

## Files to Reference from Working Repo

- `/Users/jannatwatts/trainco-site-4/src/data/traincoStaticKnowledge.ts`
- `/Users/jannatwatts/trainco-site-4/src/site-functions/navigateWithKnowledgeKey.ts`
- `/Users/jannatwatts/trainco-site-4/src/site-functions/register.ts`
- `/Users/jannatwatts/trainco-site-4/public/prompts/speak-llm-system-prompt.md`
