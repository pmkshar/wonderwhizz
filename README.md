# WonderWhiz — AI Tutor for Class 1–10

Friendly AI tutor covering Maths, Hindi, Science, and Kannada with 8 explanation
styles, multi-language voice-over, parent dashboard, progress tracking, question
banks, achievements, a math virtual keyboard, and a Flutter mobile companion.

## Quick start (local dev)

```bash
bun install
cp .env.example .env          # then edit DATABASE_URL / NEXTAUTH_SECRET
bunx prisma generate
bunx prisma db push           # creates SQLite tables
bun run dev                   # http://localhost:3000
```

## Sign in

- Use **email + password**.
- Forgot your password? Click **"Forgot password?"** on the login screen —
  enter your email + a new password and you're in.
- Google sign-in is only shown when `GOOGLE_CLIENT_ID` and
  `GOOGLE_CLIENT_SECRET` are set in the environment.

## Deploying to Vercel

Vercel's serverless functions have an **ephemeral filesystem** — a local SQLite
file would be wiped on every cold start. You must use a networked DB instead.

### Recommended: Turso (free, SQLite-compatible)

1. Sign up at <https://turso.tech> and create a database.
2. Get your connection string and auth token:
   ```bash
   turso db show <your-db> --url
   turso db tokens create <your-db>
   ```
3. In Vercel: **Project Settings → Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | `libsql://<your-db>.turso.io?authToken=<token>` |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://your-project.vercel.app` |
   | `ZAI_API_KEY` | your z-ai-web-dev-sdk key |
   | `GOOGLE_CLIENT_ID` | _(optional)_ |
   | `GOOGLE_CLIENT_SECRET` | _(optional)_ |
4. Trigger a redeploy. The `vercel-build` script in `package.json` will run
   `prisma generate` + `prisma db push` automatically on every build, so the
   remote DB schema stays in sync.

### Alternative: Postgres (Neon / Supabase / Vercel Postgres)

1. Provision a Postgres instance and copy the connection string.
2. Set `DATABASE_URL` to the Postgres URL.
3. Edit `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run `bunx prisma generate && bunx prisma db push` locally to validate, then
   commit and redeploy on Vercel.

## Health check

`GET /api/health` returns which auth providers are configured and whether the
database is reachable. Use it to debug deployment issues:

```bash
curl https://your-project.vercel.app/api/health
```

## Mobile app (Flutter)

The Flutter source lives under `flutter/wonderwhiz/`. After deploying the web
app, open `flutter/wonderwhiz/lib/api.dart` and set `baseUrl` to your Vercel
URL, then:

```bash
cd flutter/wonderwhiz
flutter pub get
flutter build apk --release    # Android
flutter build ipa --release    # iOS (needs a Mac + Xcode)
```

You can also download a zipped Flutter source from the login page.

## Project structure

```
prisma/schema.prisma        # DB models: User, Question, QuestionBank, Progress, ...
src/app/api/                # Next.js API routes (auth, register, tutor, tts, ...)
src/app/page.tsx            # Auth-gated entry — switches AuthScreen <-> AppShell
src/components/auth/        # Login / Register / Reset password UI
src/components/tutor/       # Post-login app shell + pages (Ask, Practice, Progress, Parent, Achievements)
flutter/wonderwhiz/         # Flutter mobile companion app
```
