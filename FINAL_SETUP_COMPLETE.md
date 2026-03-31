# ✅ Final Setup Complete - Train Co Agent

**Date:** March 31, 2026  
**Status:** Ready to Use

## Summary

Your Train Co application is now properly configured to use the Mobeus Agent Template system with UIFramework SDK.

## Understanding the Setup

### Mobeus Agent Template System

Your Mobeus dashboard shows you're using an **Agent Template** approach:
- **Base Template:** trAIn co
- **Agent Name:** Train Co
- **Deployed Site:** https://9z5vfnc6.sites.mobeus.ai
- **Dev API Key:** `vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30`

### How It Works

1. **UIFramework SDK** loads from CDN
2. **Agent API Key** authenticates your specific agent
3. **Agent Configuration** comes from your Mobeus dashboard:
   - Voice: Liam (ElevenLabs)
   - Avatar: Jaya (HeyGen/LiveAvatar)
   - LLM: GPT-4o
   - Custom prompts and greeting
   - MCP Server: train-co

## Current Configuration

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_WIDGET_API_KEY=vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30
NEXT_PUBLIC_WIDGET_HOST=https://app.mobeus.ai
NEXT_PUBLIC_AGENT_NAME=Train Co
NEXT_PUBLIC_DEV_TOOLBAR_HOST=localhost
```

### Layout Configuration (src/app/layout.tsx)

```typescript
// Agent configuration
<Script
  id="mobeus-agent-config"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{__html: `
    window.MOBEUS_AGENT_CONFIG = {
      apiKey: "${process.env.NEXT_PUBLIC_WIDGET_API_KEY}",
      host: "${process.env.NEXT_PUBLIC_WIDGET_HOST}",
      agentName: "Train Co"
    };
  `}}
/>

// UIFramework SDK
<Script
  src="https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js"
  strategy="afterInteractive"
/>
```

### Connection Logic (src/lib/teleConnect.ts)

- Waits for `window.UIFramework` to load
- Configures with agent API key
- Connects using UIFramework methods
- Uses agent settings from dashboard

## Testing

### Local Development

1. **Server is running:** http://localhost:3000
2. **Open in browser**
3. **Click "Begin"**
4. **Expected behavior:**
   - UIFramework SDK loads
   - Authenticates with your dev API key
   - Connects to Train Co agent
   - Jaya avatar appears
   - Liam voice speaks greeting

### Check Console

You should see:
```
[Mobeus] Agent config loaded for: Train Co
[teleConnect] UIFramework loaded: [object]
[teleConnect] Using agent API key: vk_dev_5b48511a...
[teleConnect] Connection complete
```

## Deployment

### Your Deployed Site

**URL:** https://9z5vfnc6.sites.mobeus.ai  
**Last Deployed:** 3/31/2026, 2:51:20 PM

### Deploy Updates

When you're ready to deploy your local changes:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Update Train Co agent configuration"
   git push
   ```

2. **Mobeus will auto-deploy** (if connected to your repo)
   - Or deploy manually through Mobeus dashboard

### Production API Key

For production deployment, you may want to:
1. Generate a production API key in Mobeus dashboard
2. Update environment variables in deployment settings
3. Use `vk_prod_...` or `vk_live_...` key instead of `vk_dev_...`

## Agent Configuration

All agent settings are managed in your Mobeus dashboard:

### Voice Configuration
- **Provider:** ElevenLabs
- **Voice:** Liam - Energetic, Social Media Creator
- **Model:** Eleven Flash v2.5

### Avatar Configuration
- **Provider:** HeyGen / LiveAvatar
- **Avatar:** Jaya (Launch Ready)

### LLM Configuration
- **Provider:** OpenAI
- **Model:** GPT-4o
- **Temperature:** 0.7
- **Behavior:** Allow user interruption

### MCP Servers
- **train-co** (Your Server · SSE)

## What Changed From Original

### Removed
- ❌ Hardcoded tenant UUID (`4e93127e-0dcc-432b-8c27-ed32f064d59e`)
- ❌ Manual UIFramework configuration
- ❌ Site functions bridge (now using agent template)

### Added
- ✅ Agent API key configuration
- ✅ Dynamic agent loading from dashboard
- ✅ Support for agent template system
- ✅ Updated branding to "TRAIN CO CAREER"

### Kept
- ✅ UIFramework SDK (same CDN)
- ✅ All existing components and features
- ✅ Voice and avatar integration
- ✅ Career dashboard functionality

## File Structure

```
train-co-site/
├── src/
│   ├── app/
│   │   └── layout.tsx           # Agent config + UIFramework SDK
│   ├── lib/
│   │   └── teleConnect.ts       # Connection with agent API key
│   └── [all other components]   # Unchanged
├── .env.local                   # Dev API key
└── package.json                 # Scripts (npm run dev, tele-local)
```

## Available Scripts

```bash
# Development with agent
npm run dev

# Alternative (same as dev)
npm run tele-local

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### UIFramework Not Loading

**Check:**
```javascript
// In browser console
window.UIFramework
window.MOBEUS_AGENT_CONFIG
```

**Solution:**
- Verify CDN is accessible
- Check network tab for script loading
- Clear cache and reload

### Agent Not Connecting

**Check:**
- API key is correct in `.env.local`
- Dev key only works from localhost
- Check Mobeus dashboard that agent is active

**Console should show:**
```
[teleConnect] UIFramework loaded
[teleConnect] Using agent API key: vk_dev_...
```

### Wrong Voice/Avatar

**Solution:**
- Settings come from Mobeus dashboard
- Update in dashboard, not in code
- Changes apply immediately on next connection

## Next Steps

1. ✅ Local development configured
2. ✅ Agent API key set
3. ✅ UIFramework SDK loading
4. 🔄 Test the connection
5. 🔄 Verify voice and avatar
6. 🔄 Deploy updates to production

## Resources

- **Mobeus Dashboard:** https://app.mobeus.ai
- **Your Agent:** Train Co (based on trAIn co template)
- **Deployed Site:** https://9z5vfnc6.sites.mobeus.ai
- **Local Dev:** http://localhost:3000

## Support

- **Dashboard Settings:** Configure voice, avatar, prompts
- **MCP Servers:** Manage tools and integrations
- **Deployment:** Auto-deploy from git or manual deploy

---

**Status:** ✅ Complete and ready to use!  
**Local Server:** Running at http://localhost:3000  
**Agent:** Train Co with Jaya avatar and Liam voice  
**Ready to test!** 🚀
