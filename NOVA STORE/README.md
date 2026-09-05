# NOVA STORE — نوفا ستور

A production-ready digital gaming top-up and account marketplace platform, built with **Next.js 14 App Router**, **Tailwind CSS**, **Prisma + PostgreSQL**, and key integrations for Gemini AI and Resend transactional email.

---

## What Was Built

| Area | Details |
|---|---|
| **Framework** | Next.js 14 App Router with TypeScript |
| **Styling** | Tailwind CSS with dark/light CSS variables |
| **i18n** | `next-intl` — Arabic (default, RTL) ↔ English (LTR) |
| **Theme** | `next-themes` — Dark/Light, persisted, system-aware |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | JWT (jose) + bcrypt, HTTP-only cookies |
| **AI** | Gemini API for payment screenshot verification + art prompts |
| **Email** | Resend for transactional support emails |
| **File Upload** | Local `/public/uploads/` with clean abstraction |
| **WhatsApp** | Pre-filled `wa.me` links (data always logged to DB) |
| **Chatbot** | Rule-based FAQ bot (Arabic) as floating widget |

---

## File Structure

```
NOVA STORE/
├── prisma/
│   ├── schema.prisma         # Full DB schema
│   └── seed.ts               # Initial games, fields, settings
├── messages/
│   ├── ar.json               # Arabic translations (default)
│   └── en.json               # English translations
├── public/
│   └── uploads/
│       ├── payment-screenshots/
│       └── account-listings/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/login/route.ts
│   │   │   ├── auth/register/route.ts
│   │   │   ├── admin/login/route.ts
│   │   │   ├── admin/ai-suggest/route.ts
│   │   │   ├── contact/route.ts
│   │   │   └── upload/route.ts
│   │   └── [locale]/
│   │       ├── layout.tsx             # Root layout (RTL/LTR, Header, Footer, Chatbot, WhatsApp btn)
│   │       ├── page.tsx               # Home
│   │       ├── login/page.tsx
│   │       ├── register/page.tsx
│   │       ├── games/[slug]/page.tsx  # Dynamic game top-up (MLBB: 2 fields)
│   │       ├── steam/page.tsx
│   │       ├── cart/page.tsx
│   │       ├── buy-sell/page.tsx      # Multi-image account listing + WhatsApp link
│   │       ├── orders/page.tsx
│   │       ├── settings/page.tsx
│   │       ├── contact/page.tsx
│   │       └── admin/
│   │           ├── layout.tsx         # Admin sidebar (server-gated, hidden from normal users)
│   │           ├── login/page.tsx
│   │           ├── page.tsx           # Dashboard stats
│   │           ├── games/page.tsx     # CRUD games + AI art prompt
│   │           ├── orders/page.tsx    # Orders + AI flag + status changer
│   │           ├── listings/page.tsx  # Buy/sell approvals
│   │           ├── reviews/page.tsx   # Review moderation
│   │           └── settings/page.tsx  # Store settings (live, no redeploy)
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Logo.tsx           # Custom SVG N+S monogram
│   │   ├── WhatsAppButton.tsx # Floating button → wa.me/201556723459
│   │   └── ChatbotWidget.tsx  # FAQ chatbot (Arabic)
│   ├── i18n/
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── lib/
│   │   ├── db.ts              # Prisma singleton
│   │   ├── gemini.ts          # Gemini AI (vision + art prompts) — server-side only
│   │   ├── resend.ts          # Resend email — server-side only
│   │   └── whatsapp.ts        # wa.me link builder
│   ├── middleware.ts           # JWT auth + role guard on /admin routes
│   └── providers/
│       └── theme-provider.tsx
├── .env.example
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Running Locally

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- **PostgreSQL** running locally (or a hosted instance)

### 2. Install Dependencies
```bash
cd "d:\Youssef Designer\NOVA STORE"
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example file
copy .env.example .env
```
Open `.env` and fill in your values — see the **Configuration** section below.

### 4. Setup the Database
```bash
# Run migrations
npm run db:migrate

# Seed games, fields, and default settings
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The default locale is Arabic → [http://localhost:3000/ar](http://localhost:3000/ar).

---

## Configuration — Environment Variables

Open the file **`d:\Youssef Designer\NOVA STORE\.env`** and fill in these values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/novastore` |
| `JWT_SECRET` | ✅ | A long random string for signing tokens. Generate with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_PASSWORD_HASH` | ✅ | bcrypt hash of the admin password (see below) |
| `GEMINI_API_KEY` | ⭐ | From [Google AI Studio](https://aistudio.google.com/app/apikey). Used for AI screenshot verification and game art suggestions. If omitted, AI features degrade gracefully to `needs_review`. |
| `RESEND_API_KEY` | ⭐ | From [Resend Dashboard](https://resend.com/api-keys). Used for sending support emails to `adhamsaide2@gmail.com`. If omitted, email feature is silently skipped with a server log. |
| `SUPPORT_EMAIL` | Optional | Defaults to `adhamsaide2@gmail.com` |

> ⚠️ **Never commit `.env` to Git.** It is already in `.gitignore`.

---

## Admin Access

- **URL**: `http://localhost:3000/ar/admin/login`
- **Default password**: `novastore17112011`

The literal password is **never stored** anywhere. Only its bcrypt hash is read from `ADMIN_PASSWORD_HASH` in `.env`.

### Generating the hash for your `.env`:
```bash
node -e "require('bcrypt').hash('novastore17112011', 10).then(console.log)"
```
Paste the output into your `.env` file:
```
ADMIN_PASSWORD_HASH="$2b$10$..."
```

The `/admin/*` routes are protected server-side in `middleware.ts` — non-admin JWTs are redirected away, and the admin nav link is never rendered in the DOM for non-admin users.

---

## Game ID Formats Used

| Game | Fields | Format | Real-time Lookup? |
|---|---|---|---|
| **Free Fire** | Player ID | 8–10 numeric digits | ❌ No public official API — shows "please double check" warning |
| **PUBG Mobile** | Player ID | 8–10 numeric digits | ❌ No reliable public API |
| **Mobile Legends: Bang Bang** | User ID + **Zone ID (separate field)** | User ID: 6–10 digits; Zone ID: 1–5 digits | ❌ Private API; honest fallback shown |
| **Call of Duty: Mobile** | Player UID | 8–12 numeric digits | ❌ No public API |
| **eFootball** | Player ID | 4–20 alphanumeric | ❌ No public API |
| **Roblox** | User ID | 5–12 numeric digits | ❌ No reliable public API |
| **Steam** | Email address | Valid email format | N/A — email-based |

> All formats were chosen based on the real formats these games actually use. They can all be updated from the Admin Panel → Games → Fields without touching code.

---

## API Keys & Limitations

### What requires API keys you provide:
1. **`GEMINI_API_KEY`** — AI payment screenshot verification and AI art prompt generation. Without it: screenshots show `needs_review`, art suggestion shows an error message.
2. **`RESEND_API_KEY`** — Support form emails. Without it: form submits silently fail with a server log.

### Known Limitations:
- **Payment Gateway**: Not integrated. Vodafone Cash / manual screenshot flow only. Architecture is clean to plug in Stripe/Paymob later.
- **WhatsApp Auto-send**: `wa.me` links open WhatsApp pre-filled for the user to tap "Send" — true silent server-side sending requires the WhatsApp Business Cloud API. All data is logged to the DB regardless.
- **Game ID real-time verification**: None of the listed games expose a reliable public API for account lookup. The honest "couldn't auto-verify" state is shown rather than faking a green checkmark.
- **Email From domain**: Default uses `onboarding@resend.dev`. For production, verify a custom domain in Resend and update the `from` field in `src/lib/resend.ts`.

---

## Footer Legal

Exactly as specified:
1. جميع الحقوق محفوظة ادهم سعيد
2. [تم التطوير بواسطة @youssefgraphicdesigner](https://instagram.com/youssefgraphicdesigner) — clickable, opens in new tab

---

## Deploying to Cloudflare Pages

See the detailed step-by-step guide: **[cloudflare-deployment.md](./cloudflare-deployment.md)**

### Quick checklist:
1. Create a [Neon](https://neon.tech) PostgreSQL DB → copy connection string.
2. Run `npm run db:migrate && npm run db:seed` locally (pointed at Neon).
3. Swap `bcrypt` → `bcryptjs` in 4 route files (Workers don't support native bindings).
4. Push to GitHub. Connect to Cloudflare Pages → build command: `npm run build:cf`.
5. Add all env vars in Cloudflare dashboard (DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD_HASH, GEMINI_API_KEY, RESEND_API_KEY).
6. For file uploads in production: configure Cloudflare R2 (see deployment guide).

### bcrypt swap (required before Cloudflare build):
```bash
npm uninstall bcrypt @types/bcrypt
npm install bcryptjs && npm install -D @types/bcryptjs
# Then change all `import bcrypt from 'bcrypt'` → `import bcrypt from 'bcryptjs'`
# Files: api/auth/login, api/auth/register, api/admin/login, prisma/seed.ts
```
