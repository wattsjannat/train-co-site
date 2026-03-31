# Mobeus Infrastructure Deployment Guide

This guide covers deploying the Trainco Career app to Mobeus infrastructure.

## Prerequisites

- Docker installed on the deployment server
- Access to Mobeus infrastructure
- Git repository access

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Build and Run with Docker

```bash
# Build the Docker image
docker build -t trainco-career:latest .

# Run the container
docker run -d \
  --name trainco-career \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-domain.com \
  -e NEXT_PUBLIC_AGENT_NAME="Trainco AI" \
  trainco-career:latest
```

#### Using Docker Compose

```bash
# Create .env file with your configuration
cat > .env << EOF
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_DEV_TOOLBAR_HOST=your-domain.com
NEXT_PUBLIC_AGENT_NAME=Trainco AI
EOF

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Option 2: Direct Node.js Deployment

If you prefer to run without Docker:

```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start the server
NODE_ENV=production npm start
```

## Environment Variables

Create a `.env.production` file with these variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com

# Agent Configuration
NEXT_PUBLIC_AGENT_NAME=Trainco AI

# Development (optional)
NEXT_PUBLIC_DEV_TOOLBAR_HOST=your-domain.com
```

## Mobeus-Specific Configuration

The app is pre-configured for Mobeus infrastructure with:

- **UIFramework SDK**: Loaded from `https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js`
- **Tenant UUID**: `4e93127e-0dcc-432b-8c27-ed32f064d59e`
- **LiveKit Avatar**: Enabled
- **Voice AI**: OpenAI Realtime API integration

These settings are configured in `src/app/layout.tsx`.

## Health Checks

The application exposes the following endpoints for monitoring:

- **Main App**: `http://localhost:3000/`
- **API Route**: `http://localhost:3000/api/invoke/[toolName]`

## Nginx Reverse Proxy (Optional)

If you're using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker logs trainco-career
```

### Port already in use

Change the port mapping:
```bash
docker run -d -p 8080:3000 trainco-career:latest
```

### Build fails

Clear cache and rebuild:
```bash
docker build --no-cache -t trainco-career:latest .
```

### API routes not working

Ensure the custom server is running:
- Check that `server.js` is included in the Docker image
- Verify `npm start` runs `node server.js`
- Check environment variables are set correctly

## Continuous Deployment

For automated deployments, you can use:

1. **GitHub Actions** (see `.github/workflows/deploy.yml` if available)
2. **GitLab CI/CD**
3. **Jenkins**
4. **Mobeus internal CI/CD**

Example GitHub Actions workflow:

```yaml
name: Deploy to Mobeus

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t trainco-career:latest .
      
      - name: Deploy to server
        run: |
          # Add your deployment commands here
          # e.g., push to registry, SSH to server, etc.
```

## Production Checklist

Before deploying to production:

- [ ] Environment variables are set correctly
- [ ] Docker image builds successfully
- [ ] Health checks pass
- [ ] SSL/TLS certificates configured (if using HTTPS)
- [ ] Firewall rules allow traffic on port 3000
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place
- [ ] UIFramework CDN is accessible
- [ ] LiveKit credentials configured (if needed)

## Support

For Mobeus-specific deployment issues, contact your Mobeus infrastructure team.

For application issues, check:
- `TROUBLESHOOTING.md`
- `RUNNING_THE_APP.md`
- `UIFRAMEWORK_FIX.md`
