import type { NextConfig } from 'next';

// Use /v2 basePath only for AWS deployments (when DEPLOY_TARGET=aws)
// Mobeus hosted sites should be at root (no basePath)
const isAwsDeployment = process.env.DEPLOY_TARGET === 'aws';

const nextConfig: NextConfig = {
  output: 'export',
  ...(isAwsDeployment && {
    basePath: '/v2',
    assetPrefix: '/v2',
  }),
  images: {
    unoptimized: true,
  },
  // Force new chunk names on every build to bust browser cache
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Expose MCP_SERVER_URL to client-side mcpBridge (remote fallback base URL).
  env: {
    MCP_SERVER_URL: process.env.MCP_SERVER_URL ?? '',
  },
};

export default nextConfig;
