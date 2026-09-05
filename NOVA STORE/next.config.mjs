import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Required for @cloudflare/next-on-pages
  // Comment this out when running `npm run dev` locally
  // Uncomment only when building for Cloudflare: `npm run build:cf`
  // output: 'export', // <-- DO NOT enable for Cloudflare Pages Next.js; it uses SSR
  
  images: {
    // For Cloudflare Pages with local uploads, use unoptimized
    // When using Cloudflare Images, this can be disabled
    unoptimized: true,
    remotePatterns: [],
  },

  // Ensure server-only libs don't leak to client
  serverExternalPackages: ['bcrypt', '@prisma/client', 'prisma'],
};

export default withNextIntl(nextConfig);
