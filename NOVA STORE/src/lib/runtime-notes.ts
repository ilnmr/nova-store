// For Cloudflare Pages, all API routes that use Node.js-specific APIs (fs, path)
// must use the Edge Runtime. Routes using Prisma + bcrypt use Node.js compat mode.

// This file documents runtime assignments:
// - auth routes: nodejs (bcrypt requires native bindings)
// - upload route: nodejs (uses fs.writeFile) — On Cloudflare, swap for R2 binding
// - AI / Gemini routes: nodejs (uses node-fetch)
// - All other routes: default (nodejs compat via wrangler.toml)

// To opt specific routes into Edge Runtime, add this export at the top of that route file:
// export const runtime = 'edge';

// NOTE: For Cloudflare Pages full compatibility, bcrypt should be swapped with
// bcryptjs (pure-JS implementation). The upload route should use Cloudflare R2.
// See README.md → Deployment section for the full migration guide.

export {};
