import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/v2',
  assetPrefix: '/v2',
  images: {
    unoptimized: true,
  },
  // Force new chunk names on every build to bust browser cache
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
