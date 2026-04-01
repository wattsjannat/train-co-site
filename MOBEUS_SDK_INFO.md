# Mobeus 2.0 SDK Information

## What is "UIFramework"?

The **Mobeus 2.0 SDK** is internally called "UIFramework" or "Tele Live Avatar". This is the official SDK for the Mobeus 2.0 platform (https://app.mobeus.ai).

## SDK Details

- **URL**: `https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js`
- **Version**: RAGGuard v1.1 (as of deployment)
- **Platform**: Mobeus 2.0 (API key-based authentication)
- **Internal Name**: UIFramework / Tele Live Avatar

## Why "UIFramework"?

Mobeus's internal codebase uses "UIFramework" as the library name. When you see:
- `window.UIFrameworkPreInitConfig` → Mobeus 2.0 configuration
- `window.UIFrameworkSiteFunctions` → Internal SDK functions
- `[UIFramework]` in console logs → Mobeus 2.0 SDK logs

These are all **Mobeus 2.0** references. The naming is just their internal convention.

## Authentication

### Mobeus 1.0 (Legacy - NOT USED)
```javascript
// OLD - Don't use this
explicitTenantUuid: "xxx-xxx-xxx"
```

### Mobeus 2.0 (Current)
```javascript
// NEW - API key-based
widgetApiKey: "vk_dev_xxx..."
agentApiKey: "vk_dev_xxx..."
useAgentConfig: true
```

## Configuration

The SDK is configured via `window.UIFrameworkPreInitConfig`:

```javascript
window.UIFrameworkPreInitConfig = {
  widgetApiKey: "vk_dev_xxx...",        // Your Mobeus 2.0 API key
  agentApiKey: "vk_dev_xxx...",         // Same as widgetApiKey
  apiKey: "vk_dev_xxx...",              // Same as widgetApiKey
  autoConnect: false,                   // Manual connection control
  autoConnectAvatar: false,
  autoConnectVoice: false,
  waitForAvatarBeforeVoice: true,
  voiceUIVisible: false,
  muteByDefault: false,
  enableVoiceChat: true,
  enableAvatar: true,
  useAgentConfig: true,                 // Use agent config from dashboard
  avatarID: '92329d89e4434e63b6260f9f374fffb0',  // Jaya avatar
  voiceID: '8a4dfef7aacf4ad88c10ae9391bd3098',   // Liam voice
  lightboard: {
    enabled: false,
  },
};
```

## Site Functions

Custom functions you create are registered on `window.__siteFunctions`:

```javascript
window.__siteFunctions = {
  setTheme: function(args) { /* ... */ },
  journeyWelcomeGreeting: function() { /* ... */ },
  // ... etc
};
```

The Mobeus agent can call these via the Speak LLM prompt.

## Internal SDK Functions

The SDK provides internal functions on `window.UIFrameworkSiteFunctions`:

```javascript
window.UIFrameworkSiteFunctions = {
  navigateToSection: function(badge, title, subtitle, subsections) { /* ... */ },
  setVolume: function(level) { /* ... */ },
  // ... etc
};
```

These are patched by React at runtime (see `src/hooks/usePhaseFlow.ts`).

## Console Logs

When you see these in the browser console:

```
[UIFramework] Pre-init config with API key
[UIFramework] Build version: tele-live-external-lib RAGGuard v1.1
[teleConnect] UIFramework loaded
[teleConnect] Setting agent API key: vk_dev_xxx...
```

These are all **Mobeus 2.0 SDK** logs. The "UIFramework" and "teleConnect" names are internal to Mobeus.

## Is This the Right SDK?

**YES!** This is the correct and current Mobeus 2.0 SDK. The naming might be confusing, but:

- ✅ Uses API keys (Mobeus 2.0)
- ✅ Connects to `app.mobeus.ai` dashboard
- ✅ Supports site functions
- ✅ Supports Speak LLM and Show LLM prompts
- ✅ Latest version from Mobeus CDN

## Where to Find Documentation

- **Dashboard**: https://app.mobeus.ai
- **Support**: Contact Mobeus team directly
- **CDN**: https://telecdn.s3.us-east-2.amazonaws.com/

## Summary

Don't be confused by "UIFramework" - it's just the internal name for the Mobeus 2.0 SDK. Everything is correctly configured for Mobeus 2.0 platform.
