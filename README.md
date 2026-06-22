# TheCellTime — E-Commerce & Repairs

Mobile-first shop for phones, accessories, repairs, checkout (Stripe), admin panel, and order tracking.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (database, auth, storage)
- **Stripe** (payments)
- **Nodemailer** (order emails via Gmail SMTP)

## Local setup

```bash
npm install
cp .env.example .env.local
# Fill in all values in .env.local
npm run dev
```

Run Supabase migrations in order from `supabase/migrations/` (001 through 024) in the Supabase SQL Editor.

## Production deployment (Vercel)

### 1. Environment variables

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Orders, webhooks, order tracking API |
| `STRIPE_SECRET_KEY` | Yes | Use **live** keys for production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Live publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | From Stripe webhook endpoint |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://www.thecelltime.com` |
| `ADMIN_PASSWORD` | Yes | Strong password (not `admin123`) |
| `GMAIL_APP_PASSWORD` | Yes | Google App Password for SMTP |
| `ORDER_EMAIL_FROM` | Yes | `info.celltime@gmail.com` |
| `SMTP_USER` | Yes | Same as sender email |

### 2. Supabase

Apply all migrations (`001`–`024`) on the production database if not already applied.

### 3. Stripe

1. Switch to **Live mode** in Stripe Dashboard.
2. Create webhook: `payment_intent.succeeded` → `https://www.thecelltime.com/api/stripe/webhook`
3. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
4. Enable **Customer emails → Successful payments** (optional Stripe receipts).

### 4. Gmail

Use a Google **App Password** (2FA required) for `GMAIL_APP_PASSWORD`.

### 5. Deploy

```bash
git push origin main
```

Or connect the GitHub repo to Vercel for automatic deploys.

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/shop` | Product catalog |
| `/checkout` | Stripe checkout |
| `/track-order` | Order tracking by ID + email |
| `/track` | Repair ticket tracking |
| `/account` | Customer account + order tracker |
| `/admin` | Admin panel (password protected) |

## Post-deploy smoke test

1. Browse shop, add to cart, complete test/live payment.
2. Confirm order appears in `/admin` → Orders.
3. Confirm customer receives confirmation email (check spam once).
4. Update order status → customer receives status email.
5. Track order at `/track-order` with order ID + email.
6. Verify admin APIs return 401 without login (open `/api/admin/stats` in browser).

## Security notes

- Admin API routes require an httpOnly session cookie after login.
- Never commit `.env.local` or share `SUPABASE_SERVICE_ROLE_KEY`.
- Use a strong `ADMIN_PASSWORD` in production.

## i18n

Italian (default), English, French — `lib/i18n/translations/`
