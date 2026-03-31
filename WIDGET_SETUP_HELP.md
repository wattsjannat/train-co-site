# 🔧 Mobeus Widget Setup Help

## Current Issue

The Mobeus widget is not loading. This means we need the correct embed code from your Mobeus dashboard.

## How to Get the Correct Widget Code

### Step 1: Go to Your Mobeus Dashboard

1. Visit: **https://app.mobeus.ai**
2. Log in to your account
3. Select your **Train Co** agent

### Step 2: Find the Embed/Integration Code

Look for one of these sections in your agent settings:
- **Integration**
- **Embed Code**
- **Widget**
- **Installation**
- **Developers**

### Step 3: Copy the Embed Code

You should see something like one of these formats:

#### Format 1: Script Tag
```html
<script src="https://some-url.com/widget.js" data-api-key="your-key"></script>
```

#### Format 2: Embed Code
```html
<script>
  (function() {
    // Widget initialization code
  })();
</script>
<script src="https://some-url.com/embed.js"></script>
```

#### Format 3: SDK Import
```javascript
import Mobeus from '@mobeus/sdk';
// or
<script src="https://cdn.mobeus.ai/sdk.js"></script>
```

## What I Need From You

Please provide:

1. **The exact script URL** from your dashboard
   - Example: `https://cdn.mobeus.ai/widget.js`
   
2. **The API key format** you see
   - Is it `vk_dev_...` or something else?
   
3. **Any initialization code** shown in the dashboard
   - Copy the entire embed code block

## Current Configuration

We're currently trying these URLs:
- `https://app.mobeus.ai/widget.js`
- `https://app.mobeus.ai/embed.js`
- `https://app.mobeus.ai/sdk.js`
- `https://cdn.mobeus.ai/widget.js`

The browser console will show which URLs were tried and which failed.

## Debugging

### Check Browser Console

Open http://localhost:3000 and check the console for:

```
[Mobeus] Config loaded: {apiKey: "...", host: "..."}
[Mobeus] Trying to load from: https://...
[Mobeus] Failed to load from: https://...
```

This will tell us which URLs are being attempted.

### Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Filter by "JS"
4. Look for failed requests to Mobeus URLs
5. Check the response/error

## Alternative: Manual Widget Integration

If you have the embed code from your dashboard, we can add it directly. Just provide:

1. The complete embed code from your dashboard
2. I'll integrate it properly into the layout

## Common Widget URL Patterns

Different platforms use different patterns:

- **Mobeus**: `https://app.mobeus.ai/...` or `https://cdn.mobeus.ai/...`
- **Custom Domain**: `https://your-domain.com/widget.js`
- **CDN**: `https://cdn.example.com/mobeus/...`

## Next Steps

1. **Check your Mobeus dashboard** for the embed code
2. **Copy the exact script URL and code**
3. **Share it with me** so I can update the integration
4. **Or** paste the embed code in `.env.local` if it's simple

## Current Server Status

✅ Server running: http://localhost:3000  
⚠️ Widget not loading: Need correct URL from dashboard  
✅ API Key configured: `vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30`

---

**Once you provide the correct widget URL/code, I can update the integration immediately!**
