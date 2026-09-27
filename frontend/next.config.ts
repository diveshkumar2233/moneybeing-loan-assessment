import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default function config(phase: string): NextConfig {
  const staticExport = process.env.NEXT_STATIC_EXPORT === 'true';
  // In export mode distDir names the published output, which Docker copies from out.
  // Keep the dev cache separate so production builds cannot break local dev assets.
  const defaultDirectory = staticExport
    ? 'out'
    : phase === PHASE_DEVELOPMENT_SERVER
      ? '.next-dev'
      : '.next';
  return {
    reactStrictMode: true,
    poweredByHeader: false,
    distDir: process.env.NEXT_DIST_DIR || defaultDirectory,
    ...(staticExport ? { output: 'export' as const, trailingSlash: true } : {}),
  };
}
