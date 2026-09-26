import type { NextConfig } from 'next';
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR || '.next',
  ...(process.env.NEXT_STATIC_EXPORT === 'true'
    ? { output: 'export' as const, trailingSlash: true }
    : {}),
};
export default config;
