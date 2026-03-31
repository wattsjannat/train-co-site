# Train Co - New Mobeus Platform Setup

## ✅ Migration Complete

Your application has been updated to use the **new Mobeus platform** with your **Train Co agent template**.

### What Changed

#### ❌ Removed (Old Platform)
- Old tenant UUID: `4e93127e-0dcc-432b-8c27-ed32f064d59e`
- Legacy UIFramework CDN script
- Manual UIFramework configuration
- Site functions bridge
- Employer mode interceptor

#### ✅ Added (New Platform)
- Mobeus Widget integration
- Environment-based API key configuration
- Simplified agent template approach
- Automatic widget initialization

## 🔑 Required Configuration

### Step 1: Get Your Widget API Key

1. Go to your Mobeus Dashboard: https://app.mobeus.ai
2. Navigate to your **Train Co** agent
3. Go to **Settings** or **Integration**
4. Copy your **Widget API Key**

### Step 2: Update Environment Variables

Edit `.env.local` and add your API key:

```env
# Mobeus Widget Configuration (New Platform)
NEXT_PUBLIC_WIDGET_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_WIDGET_HOST=https://app.mobeus.ai

# Agent Configuration
NEXT_PUBLIC_AGENT_NAME=Train Co
```

### Step 3: Rebuild and Restart

```bash
# Clean build
rm -rf .next out

# Rebuild
npm run build

# Restart dev server
npm run dev
```

## 📝 How It Works Now

### Widget Integration

The new platform uses a simple widget script that automatically:
- Loads your Train Co agent configuration
- Initializes the voice and avatar features
- Handles all the connection logic
- Applies your agent's custom settings

### Code Changes

**In `src/app/layout.tsx`:**
```typescript
<Script
  src={`${process.env.NEXT_PUBLIC_WIDGET_HOST}/widget.js`}
  strategy="afterInteractive"
  data-api-key={process.env.NEXT_PUBLIC_WIDGET_API_KEY}
/>
```

**In `src/lib/teleConnect.ts`:**
- Now checks for `window.Mobeus` (new platform) or `window.UIFramework` (fallback)
- Supports both connection methods for compatibility

## 🧪 Testing

### 1. Start the Application
```bash
npm run dev
```

### 2. Open Browser Console
Visit http://localhost:3000 and open Developer Tools (F12)

### 3. Check Widget Loading
```javascript
// Should return your widget instance
window.Mobeus

// Or check if it's loaded
console.log('Mobeus loaded:', !!window.Mobeus);
```

### 4. Test Connection
1. Click the "Begin" button
2. Watch the console for connection messages
3. The Train Co agent should connect and greet you

## 🔍 Troubleshooting

### Widget Not Loading

**Check the API key:**
```bash
# View your current env vars
cat .env.local
```

**Check browser console for errors:**
- Look for 401/403 errors (invalid API key)
- Look for CORS errors (wrong host)
- Look for script loading errors

### Agent Not Connecting

**Verify the widget is loaded:**
```javascript
console.log(window.Mobeus);
```

**Check connection method:**
```javascript
// Try manual connection
window.Mobeus?.connect?.();
```

### Wrong Agent Appearing

**Clear browser cache:**
- Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
- Or clear site data in DevTools

**Verify API key:**
- Make sure you're using the API key from your Train Co agent
- Not from a different agent or the old platform

## 📊 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_WIDGET_API_KEY` | Your Train Co agent API key | `wk_live_abc123...` |
| `NEXT_PUBLIC_WIDGET_HOST` | Mobeus platform URL | `https://app.mobeus.ai` |
| `NEXT_PUBLIC_AGENT_NAME` | Display name for your agent | `Train Co` |

## 🚀 Deployment

### For Production

1. **Update `.env.production` or platform environment variables:**
   ```env
   NEXT_PUBLIC_WIDGET_API_KEY=your_production_api_key
   NEXT_PUBLIC_WIDGET_HOST=https://app.mobeus.ai
   NEXT_PUBLIC_AGENT_NAME=Train Co
   ```

2. **Deploy using your preferred method:**
   - Vercel: `vercel deploy --prod`
   - Docker: `docker-compose up -d`
   - Railway: `railway up`
   - Heroku: `git push heroku main`

### Environment-Specific Keys

You can use different API keys for different environments:

- **Development**: Use a dev/test API key in `.env.local`
- **Staging**: Use a staging API key in your staging environment
- **Production**: Use a production API key in your production environment

## 📚 Additional Resources

- **Mobeus Dashboard**: https://app.mobeus.ai
- **Widget Documentation**: Check your Mobeus dashboard for widget docs
- **Agent Settings**: Configure your Train Co agent in the dashboard

## ✨ Benefits of New Platform

1. **Simpler Integration** - Just add the widget script and API key
2. **Centralized Configuration** - Manage agent settings in the dashboard
3. **Automatic Updates** - Widget updates automatically without code changes
4. **Better Analytics** - Track usage and performance in the dashboard
5. **Multi-Agent Support** - Easy to switch between different agents

---

**Next Steps:**
1. Get your Widget API key from the Mobeus dashboard
2. Update `.env.local` with your API key
3. Restart the dev server
4. Test the Train Co agent connection

Need help? Check the Mobeus dashboard documentation or contact support.
