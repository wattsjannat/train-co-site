# UIFramework Connection Fix

## Problem
The app was stuck on "Connecting..." screen indefinitely when running locally. The connecting screen would appear but never transition to the main app.

## Root Cause
The app relies on the `UIFramework` JavaScript library (from Mobeus/Tele) to handle:
- Avatar connection (LiveKit video stream)
- Voice AI connection (OpenAI Realtime API)
- Speech synthesis and recognition

In the original Vite-based trainco-v1 project, this was loaded via `<script>` tags in `index.html`. However, Next.js doesn't use `index.html` - it uses the App Router layout system.

The `connectTele()` function in `src/lib/teleConnect.ts` waits up to 5 seconds for `window.UIFramework` to be available:

```typescript
// Wait up to 5 s for CDN script to load
let attempts = 0;
while (!(window as any).UIFramework && attempts < 50) {
  await new Promise((r) => setTimeout(r, 100));
  attempts++;
}

const fw = (window as any).UIFramework;
if (!fw) {
  console.warn("[teleConnect] UIFramework not available after 5s");
  return; // Connection fails silently
}
```

Without the script loaded, the function would timeout and the app would remain stuck on the connecting screen.

## Solution

Added the UIFramework CDN script and configuration to the Next.js layout (`src/app/layout.tsx`):

### 1. UIFramework Configuration
```javascript
window.UIFRAMEWORK_AUTO_INIT = true;
window.UIFrameworkPreInitConfig = {
  explicitTenantUuid: "4e93127e-0dcc-432b-8c27-ed32f064d59e",
  autoConnect: false,
  autoConnectAvatar: false,
  autoConnectVoice: false,
  waitForAvatarBeforeVoice: true,
  voiceUIVisible: false,
  muteByDefault: false,
  enableVoiceChat: true,
  enableAvatar: true,
  lightboard: { enabled: false },
};
```

### 2. Site Functions Bridge
Registered placeholder functions for:
- `navigateToSection()` - Navigation bridge (patched by React at runtime)
- `setVolume()` - Volume control
- MCP data bridges (`fetchJobs`, `fetchSkills`, `fetchCandidate`, etc.)

### 3. Employer Mode Setup
Intercepts `getUserMedia` to provide synthetic audio stream when in employer mode (prevents mic access).

### 4. UIFramework SDK Script
```html
<script type="module" src="https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js" />
```

## Implementation Details

All scripts are added to the `<head>` section of the layout using `dangerouslySetInnerHTML` for inline scripts and standard `<script>` tags for external modules.

The scripts must load in this order:
1. UIFramework config (sets up `window.UIFrameworkPreInitConfig`)
2. Site functions bridge (registers `window.UIFrameworkSiteFunctions`)
3. Employer mode interceptor (wraps `navigator.mediaDevices.getUserMedia`)
4. UIFramework SDK (loads from CDN)

## Testing

After this fix:
1. The app loads successfully
2. The "Connecting..." screen appears briefly
3. UIFramework loads from CDN
4. Avatar and voice connections are established
5. The app transitions to the main interface

## Files Modified
- `src/app/layout.tsx` - Added UIFramework scripts and configuration

## Related Files
- `src/lib/teleConnect.ts` - Connection logic that depends on UIFramework
- `src/components/ConnectingScreen.tsx` - The connecting UI that was stuck
- `src/App.tsx` - Main app that manages connection state

## Notes
- The UIFramework is a proprietary SDK from Mobeus/Tele
- It handles LiveKit avatar streaming and OpenAI Realtime voice
- The tenant UUID is specific to the Trainco/Mobeus deployment
- Without this script, the app cannot establish voice/avatar connections
