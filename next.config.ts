import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/v2',
  assetPrefix: '/v2',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
