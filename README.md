# FAFY — Beta App

Private working engine for Stephanie's paid life-advice community **FAFY**
(front-door form "F*ck Around & Find Yourself"). Next.js 14 (App Router,
TypeScript) + Supabase (auth + Postgres) + Stripe-ready checkout.

## Local dev

```bash
cp .env.example .env.local   # fill in your values
npm install
npm run dev                  # http://localhost:3000
```

## Supabase setup

1. Create a project (e.g. `fafy-beta`) at supabase.com.
2. **SQL Editor → New query**, paste `supabase/schema.sql`, run it.
   This creates every table, RLS policies, and the `is_admin()` helper.
3. **Authentication → Providers → Email**: enable.
4. **Settings → API**: copy URL + anon key into `.env.local`.

The **first-ever user to sign up becomes founder/admin** (handled in the
signup flow via a "no profiles exist yet" check — no seed needed).

## Deploy on Vercel

1. Push this repo to GitHub, then Vercel → Add New Project → Import.
2. Add all `.env` variables (use **test** Stripe keys for beta,
   **live** keys only at the public open).
3. In Stripe Dashboard → Developers → Webhooks, add
   `https://fafy.community/api/stripe/webhook` listening to
   `checkout.session.completed` and `customer.subscription.updated`,
   paste the signing secret as `STRIPE_WEBHOOK_SECRET`.

## Porkbun DNS for fafy.community

In Vercel → Project → Settings → Domains, add `fafy.community` (and
`www.fafy.community`). Vercel shows you exact records; paste them into
Porkbun → Domain Management → DNS:

- `A` record for `@` → Vercel's IP (if using apex), or
- `CNAME` for `www` → `cname.vercel-dns.com`

Verify propagation (`dig fafy.community`) before announcing anything.
Keep WHOIS privacy + auto-renew on.

## Beta mode

Set `BETA_INVITE_CODE` in env to gate signups behind an invite code
(invite-only beta, no public signup). Leave unset for open signup.
Beta testers should get Plus free during beta (flip their plan in Admin).

## Stripe note

Checkout records the subscription internally and stores status on the
user profile. Real charging only happens when real keys are installed;
test mode charges nothing real. Never paste secret keys into chat —
they live only in Vercel's Environment Variables UI.
