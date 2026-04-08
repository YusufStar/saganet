import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // API Gateway URL for server-side requests
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  },
};

export default nextConfig;
