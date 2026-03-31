# ✅ New Mobeus Widget Integration - Clean Implementation

**Date:** March 31, 2026  
**Status:** Complete - Widget-Only Approach

## Summary

Your application now uses **ONLY** the new Mobeus Widget platform. All legacy UIFramework code has been removed.

## Changes Made

### 1. Layout Configuration (src/app/layout.tsx)

**Clean widget integration:**
```typescript
<Script
  src={`${process.env.NEXT_PUBLIC_WIDGET_HOST}/widget.js`}
  strategy="afterInteractive"
  data-api-key={process.env.NEXT_PUBLIC_WIDGET_API_KEY}
/>
```

- ✅ Loads widget from `https://app.mobeus.ai/widget.js`
- ✅ Uses API key from environment variable
- ✅ No legacy fallbacks
- ✅ No manual configuration

### 2. Connection Logic (src/lib/teleConnect.ts)

**Simplified to widget-only:**
```typescript
// Waits for window.Mobeus only
const mobeus = (window as any).Mobeus;

// Uses widget's API methods
await mobeus.connect();
```

**All functions updated:**
- `connectTele()` - Connects using `window.Mobeus`
- `disconnectTele()` - Disconnects using widget API
- `connectVoiceOnly()` - Voice-only connection via widget

### 3. Removed All Legacy Code

**Deleted:**
- ❌ Old tenant UUID configuration
- ❌ UIFramework CDN scripts
- ❌ Manual pre-init configuration
- ❌ Site functions bridge
- ❌ Employer mode interceptor
- ❌ Mock API interceptor
- ❌ Fallback to UIFramework
- ❌ Legacy connection methods

## Current Configuration

### Environment Variables (.env.local)

```env
# Mobeus Widget Configuration
NEXT_PUBLIC_WIDGET_API_KEY=vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30
NEXT_PUBLIC_WIDGET_HOST=https://app.mobeus.ai

# Agent Configuration
NEXT_PUBLIC_AGENT_NAME=Train Co
```

## How It Works

### 1. Widget Loading
- Widget script loads from Mobeus platform
- API key authenticates your Train Co agent
- Widget automatically initializes with agent settings

### 2. Connection Flow
```
User clicks "Begin"
  ↓
connectTele() waits for window.Mobeus
  ↓
Calls mobeus.connect()
  ↓
Widget handles all connection logic
  ↓
Agent starts based on dashboard configuration
```

### 3. Agent Configuration
All agent settings are managed in the Mobeus dashboard:
- Voice settings
- Avatar configuration
- Greeting messages
- Tools and functions
- Behavior and personality

## Testing

### Check Widget Loading

Open browser console at http://localhost:3000:

```javascript
// Check if widget is loaded
console.log(window.Mobeus);

// Should show the widget object with methods like:
// - connect()
// - disconnect()
// - isConnected()
// - sendMessage()
```

### Test Connection

1. Click "Begin" button
2. Watch console for:
   ```
   [teleConnect] Mobeus Widget found: [object]
   [teleConnect] Connection complete
   ```

### Verify API Key

If widget doesn't load, check:
```javascript
// In browser console
console.log('API Key set:', !!document.querySelector('[data-api-key]'));
```

## Troubleshooting

### Widget Not Loading

**Symptom:** `[teleConnect] Mobeus Widget not available after 5s`

**Solutions:**
1. Check API key is correct in `.env.local`
2. Verify widget URL is accessible: https://app.mobeus.ai/widget.js
3. Check browser console for network errors
4. Clear browser cache and hard reload

### Wrong Agent Appearing

**Solution:**
- Verify API key belongs to your Train Co agent
- Check Mobeus dashboard that Train Co agent is active
- Clear browser cache

### Connection Fails

**Check:**
```javascript
// Widget loaded?
!!window.Mobeus

// API key present?
document.querySelector('[data-api-key]')?.getAttribute('data-api-key')

// Try manual connection
window.Mobeus?.connect()
```

## Benefits of Widget-Only Approach

### ✅ Simplicity
- Single script tag
- No manual configuration
- No complex initialization

### ✅ Maintainability
- Less code to maintain
- No legacy fallbacks
- Clear, single path

### ✅ Flexibility
- Change agent settings in dashboard
- No code changes needed
- Easy to switch agents

### ✅ Updates
- Widget auto-updates
- New features automatically available
- No SDK version management

## File Structure

```
train-co-site/
├── src/
│   ├── app/
│   │   └── layout.tsx          # Widget script tag
│   └── lib/
│       └── teleConnect.ts      # Widget connection logic
├── .env.local                  # API key configuration
└── NEW_WIDGET_ONLY.md         # This file
```

## Deployment

### Environment Variables Required

```env
NEXT_PUBLIC_WIDGET_API_KEY=your_production_api_key
NEXT_PUBLIC_WIDGET_HOST=https://app.mobeus.ai
NEXT_PUBLIC_AGENT_NAME=Train Co
```

### Build and Deploy

```bash
# Build
npm run build

# Deploy to any platform
# Vercel, Railway, Heroku, Docker, etc.
```

## API Key Management

### Development
- Use dev API key: `vk_dev_...`
- Set in `.env.local`

### Production
- Use production API key: `vk_prod_...` or `vk_live_...`
- Set in deployment platform environment variables

### Get API Keys
1. Go to https://app.mobeus.ai
2. Select your Train Co agent
3. Navigate to Settings → Integration
4. Copy the appropriate API key

## Next Steps

1. ✅ Widget integration complete
2. ✅ Legacy code removed
3. ✅ API key configured
4. 🔄 Test the connection
5. 🔄 Configure agent in dashboard
6. 🔄 Deploy to production

## Support

- **Dashboard:** https://app.mobeus.ai
- **Widget Docs:** Check Mobeus dashboard documentation
- **Agent Settings:** Configure in Train Co agent dashboard

---

**Status:** Server running at http://localhost:3000  
**Widget:** New platform only (no legacy support)  
**API Key:** Configured and ready  
**Ready to test!** 🚀
