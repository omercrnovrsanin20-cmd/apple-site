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
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open http://localhost:3000/customer, `/staff`, or `/owner`.

- Staff dev password: `12345678` (env var `STAFF_PASSWORD`)
- Owner dev credentials: set via `OWNER_EMAIL` / `OWNER_PASSWORD` in `.env`

Run the end-to-end test suite (starts against a running dev server on port
3100 — see `playwright.config.ts`):

```bash
npm run test:e2e
```
