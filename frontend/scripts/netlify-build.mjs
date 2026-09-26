import { spawnSync } from 'node:child_process';

// Fail before publishing a frontend whose API would point at the visitor's laptop.
const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
let backend;
try {
  backend = new URL(configured);
} catch {
  console.error('Set NEXT_PUBLIC_API_URL in Netlify to your deployed HTTPS backend origin.');
  process.exit(1);
}
if (
  backend.protocol !== 'https:' ||
  ['localhost', '127.0.0.1', '[::1]'].includes(backend.hostname) ||
  backend.username || backend.password || backend.search || backend.hash ||
  backend.pathname !== '/'
) {
  console.error('NEXT_PUBLIC_API_URL must be a public HTTPS origin, without credentials, /api, query or fragment.');
  process.exit(1);
}
if (process.argv.includes('--check')) {
  console.log('Netlify backend URL configuration is valid.');
} else {
  const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_STATIC_EXPORT: 'true',
      NEXT_PUBLIC_API_URL: backend.origin,
    },
  });
  if (result.error) console.error(result.error.message);
  process.exit(result.status ?? 1);
}
