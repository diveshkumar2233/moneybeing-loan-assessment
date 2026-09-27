import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default function config(phase: string): NextConfig {
  const staticExport = process.env.NEXT_STATIC_EXPORT === 'true';
  // Separate caches prevent an export/build from replacing a running dev server's assets.
  const defaultDirectory = staticExport
    ? '.next-export'
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
