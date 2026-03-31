# Build Configuration

This document describes how to build and deploy this Next.js application.

## Build Commands

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

## Requirements

- **Node.js**: 20.x or higher
- **npm**: 9.x or higher

## Build Output

The build process creates a `.next` directory containing:
- Optimized production bundles
- Server-side rendering components
- API routes
- Static assets

## Server Configuration

This application uses a **custom Node.js server** (`server.js`) and requires:
- Full Node.js runtime (not static hosting)
- Support for API routes
- Port 3000 (configurable via PORT environment variable)

## Environment Variables

Required for production:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_AGENT_NAME=Trainco AI
```

## Deployment Platforms

This app is compatible with:
- ✅ Vercel (with custom server)
- ✅ Render
- ✅ Railway
- ✅ Heroku
- ✅ Docker
- ✅ Any Node.js hosting platform

## Important Notes

- **DO NOT use `output: 'export'`** - This app requires API routes
- **Custom server required** - Uses `server.js` for Node.js runtime
- **Not a static site** - Requires server-side rendering and API endpoints

## Health Check

The application is ready when:
- Server responds on configured port (default: 3000)
- Homepage loads at `/`
- API routes respond at `/api/invoke/[toolName]`
