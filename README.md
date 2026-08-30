# Lustro Detailing — Business Management Platform

A premium automotive detailing business management platform for Montenegro,
built as three connected portals sharing one Next.js backend, one Supabase
Postgres database, and Supabase Storage for uploaded photos:

- **Customer Portal** — `/customer`
- **Staff Portal** — `/staff`
- **Owner Portal** — `/owner`

See the end-of-task report for full architecture, testing results, and a
feature-by-feature status breakdown.

## Setup (Supabase required)

The app needs a Supabase project for both the database and photo storage —
there's no local-only mode anymore. One free Supabase project covers dev and
production.

1. Create a project at https://supabase.com (free tier is enough).
2. In the Supabase dashboard: **Project Settings → Database** — copy the
   **Transaction pooler** connection string (port 6543) and the **direct**
   connection string (port 5432).
3. **Project Settings → API** — copy the **Project URL** and the
   **service_role** secret key (not the anon key).
4. **Storage** → **New bucket** → name it exactly `photos`, set it to
   **Private**. Nothing else to configure — the app always reads/writes it
   server-side with the service role key, never directly from the browser.
5. Fill in `.env` (see `.env.example`):
   ```
   DATABASE_URL="<pooler connection string>"
   DIRECT_URL="<direct connection string>"
   SUPABASE_URL="<project URL>"
   SUPABASE_SERVICE_ROLE_KEY="<service_role key>"
   ```

```bash
npm install
cp .env.example .env   # then fill in the Supabase values above
npm run dev            # pushes the schema + seeds the database automatically
```

Open http://localhost:3000/customer, `/staff`, or `/owner`.

- Staff dev password: `12345678` (env var `STAFF_PASSWORD`)
- Owner dev credentials: set via `OWNER_EMAIL` / `OWNER_PASSWORD` in `.env`

## "Continue with Google" (Customer portal)

Email/password login always works with no setup. To make the Google button
on `/customer/login` and `/customer/register` actually sign people in:

1. Go to https://console.cloud.google.com/apis/credentials (any Google
   account works, this is free).
2. If prompted, configure the "OAuth consent screen" first — choose
   **External**, fill in an app name/support email, and leave it in
   **Testing** mode (no Google review needed for local development).
3. Click **Create Credentials → OAuth client ID**, application type
   **Web application**.
4. Under **Authorized redirect URIs**, add exactly:
   `http://localhost:3000/api/auth/customer/google/callback`
   (match the port you actually run on, and update `APP_URL` in `.env` to
   match too if it's not 3000).
5. Copy the generated **Client ID** and **Client secret** into `.env`:
   ```
   GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="..."
   ```
6. Restart `npm run dev`. The button now creates a real Customer account
   (or logs an existing one in) using the signed-in Google email.

Without these two variables set, the button is still visible but shows a
clear "Google sign-in isn't set up yet" message instead of failing silently.

Run the end-to-end test suite (starts against a running dev server on port
3100 — see `playwright.config.ts`):

```bash
npm run test:e2e
```

## Deploying to Netlify

1. Push this repo to GitHub (already done if you're reading this from there).
2. In Netlify: **Add new site → Import an existing project**, pick this repo.
   Netlify auto-detects Next.js via `netlify.toml` — no build settings to
   change.
3. Under **Site configuration → Environment variables**, add every variable
   from `.env.example` with real production values:
   - `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
     — same Supabase project as local dev, or a separate one for production.
   - `AUTH_SECRET` — generate a fresh long random string, don't reuse the dev one.
   - `STAFF_PASSWORD`, `OWNER_EMAIL`, `OWNER_PASSWORD` — your real values.
   - `APP_URL` — your Netlify site's URL, e.g. `https://your-site.netlify.app`.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — see below.
4. Deploy. The build runs `prisma db push` + seeding automatically, same as
   local dev.
5. **If using Google sign-in in production**: go back to the Google Cloud
   Console credentials page, open your OAuth client, and add your real
   Netlify URL to both **Authorized JavaScript origins**
   (`https://your-site.netlify.app`) and **Authorized redirect URIs**
   (`https://your-site.netlify.app/api/auth/customer/google/callback`) —
   Google only allows sign-in from domains listed there.
