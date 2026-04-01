# Train Co Site

AI-powered career coaching platform with live avatar interaction.

## Mobeus Integration

This app connects to the Mobeus platform using the UIFramework SDK:

1. **API Key Configuration** - Set in `.env.local`:
   ```env
   NEXT_PUBLIC_WIDGET_API_KEY=vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30
   NEXT_PUBLIC_WIDGET_HOST=https://app.mobeus.ai
   NEXT_PUBLIC_AGENT_NAME=Train Co
   ```

2. **SDK Loading** - The Mobeus SDK is loaded in `src/app/layout.tsx`:
   ```typescript
   <Script src="https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js" />
   ```

3. **Connection** - Avatar connection is managed in `src/lib/teleConnect.ts`

The API key is baked into the build at build-time (required for Next.js static export).

## Deploy to AWS ECS

### Prerequisites
- AWS SSO configured with Admin-Account-Access profile
- Docker Desktop running

### Deployment Steps

1. **Authenticate with AWS**:
   ```bash
   aws sso login --profile Admin-Account-Access-222308823987
   ```

2. **Deploy**:
   ```bash
   export MOBEUS_API_KEY="vk_dev_5b48511ab42cc4719aded03329b36b2af8b9c646345d3b30"
   ./deploy-to-trainco-v1.sh
   ```

The script will:
- Build the Next.js app with the API key
- Build Docker image for linux/amd64
- Push to ECR
- Update ECS service

### Live URL
https://train-v1.rapidprototype.ai/v2

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`
