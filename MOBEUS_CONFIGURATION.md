# Mobeus Instance Configuration

## Current Mobeus/UIFramework Setup

Your application is configured to use the following Mobeus instance:

### 🔑 Tenant Configuration

**Tenant UUID:** `4e93127e-0dcc-432b-8c27-ed32f064d59e`

This is configured in: `src/app/layout.tsx` (line 67)

```typescript
explicitTenantUuid: "4e93127e-0dcc-432b-8c27-ed32f064d59e"
```

### 📦 UIFramework SDK

**CDN URL:** `https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js`

This is loaded in: `src/app/layout.tsx` (line 166)

### ⚙️ UIFramework Configuration

The following settings are configured in `src/app/layout.tsx`:

```javascript
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
  lightboard: {
    enabled: false,
  },
};
```

### 🔍 How to Verify Which Instance Is Running

#### Method 1: Check Browser Console
Open your browser's developer console and run:

```javascript
// Check the tenant UUID
window.UIFrameworkPreInitConfig?.explicitTenantUuid

// Check UIFramework instance
window.UIFramework?.instance

// Check connection state
window.UIFramework?.getVoiceChatState?.()
```

#### Method 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Look for requests to:
   - `telecdn.s3.us-east-2.amazonaws.com` (CDN)
   - Any API calls with the tenant UUID

#### Method 3: Check the Source Code
The tenant UUID is hardcoded in the HTML output. View page source and search for:
- `explicitTenantUuid`
- `4e93127e-0dcc-432b-8c27-ed32f064d59e`

### 📝 Configuration Files

The Mobeus instance configuration is set in these files:

1. **`src/app/layout.tsx`** - Main UIFramework configuration
   - Tenant UUID
   - SDK loading
   - Pre-init config
   - Site functions bridge

2. **`.mobeusrc`** - Mobeus deployment settings
   - Build and start commands
   - Port configuration
   - Node version

3. **`mobeus.json`** - Additional Mobeus metadata
   - Runtime configuration
   - Framework detection

### 🔄 How to Change the Mobeus Instance

If you need to use a different Mobeus tenant/instance:

1. **Update the Tenant UUID** in `src/app/layout.tsx`:
   ```typescript
   explicitTenantUuid: "YOUR-NEW-TENANT-UUID-HERE"
   ```

2. **Update the CDN URL** (if different) in `src/app/layout.tsx`:
   ```typescript
   src="https://your-cdn-url.com/js/ui-framework-liveavatar.js"
   ```

3. **Rebuild the application**:
   ```bash
   npm run build
   ```

4. **Restart the server**:
   ```bash
   npm start
   ```

### 🎯 Connection Flow

The application connects to Mobeus in this sequence:

1. **Page Load** → UIFramework SDK loads from CDN
2. **User Clicks "Begin"** → `connectTele()` is called
3. **Connection Process**:
   - Waits for UIFramework to be available (max 5s)
   - Calls `fw.connectAll()` or `fw.connectOpenAI()`
   - Waits for avatar connection (LiveKit)
   - Waits for voice connection (OpenAI Realtime API)
   - Sends initial greeting/prompt via `teleAcknowledge()`

This is implemented in: `src/lib/teleConnect.ts`

### 🐛 Troubleshooting

**If the wrong instance is being used:**

1. Clear browser cache and hard reload (Cmd+Shift+R or Ctrl+Shift+F5)
2. Check if there are multiple deployments running
3. Verify the tenant UUID in the browser console
4. Check if environment variables are overriding the config

**If UIFramework doesn't load:**

1. Check network tab for CDN request
2. Verify the CDN URL is accessible
3. Check for CORS errors in console
4. Ensure the tenant UUID is valid

### 📊 Current Instance Details

- **Tenant UUID:** `4e93127e-0dcc-432b-8c27-ed32f064d59e`
- **CDN:** `telecdn.s3.us-east-2.amazonaws.com`
- **SDK:** `ui-framework-liveavatar.js`
- **Features Enabled:**
  - ✅ Voice Chat (OpenAI Realtime API)
  - ✅ Live Avatar (LiveKit)
  - ❌ Lightboard
  - ❌ Auto-connect

### 🔗 Related Files

- `src/lib/teleConnect.ts` - Connection logic
- `src/lib/teleState.ts` - State management
- `src/utils/teleUtils.ts` - Utility functions
- `src/contexts/TeleSpeechContext.tsx` - Speech context

---

**Note:** This configuration was migrated from `test-site-2` and should match the working setup from that deployment.
