# Lustro Detailing — Business Management Platform

A premium automotive detailing business management platform for Montenegro,
built as three connected portals sharing one Next.js backend and one SQLite
database:

- **Customer Portal** — `/customer`
- **Staff Portal** — `/staff`
- **Owner Portal** — `/owner`

See the end-of-task report for full architecture, testing results, and a
feature-by-feature status breakdown. Quick start:

```bash
npm install
cp .env.example .env   # fill in real values for anything beyond local dev
npm run dev            # migrates + seeds the database automatically
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
