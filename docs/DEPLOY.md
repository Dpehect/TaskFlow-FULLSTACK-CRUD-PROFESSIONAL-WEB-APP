# TaskFlow — Production Fix & Deploy Guide

Live app (example): `https://task-flow-fullstack-crud-profession.vercel.app`

---

## 1. Why you see 503 / Sign-in broken

Most common causes:

| Symptom | Cause |
|--------|--------|
| **503 Service Unavailable** | Missing env vars on Vercel (`AUTH_SECRET`, `DATABASE_URL`) → server crash |
| **Sign-in does nothing / error** | Wrong or missing `AUTH_GITHUB_SECRET` |
| **OAuthCallback error** | GitHub callback URL ≠ production URL |
| **DB errors after login** | Migrations not applied on Neon |

---

## 2. GitHub OAuth App (required)

1. Open [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. **New OAuth App** (or edit existing):

| Field | Value |
|-------|--------|
| Application name | `TaskFlow` |
| Homepage URL | `https://task-flow-fullstack-crud-profession.vercel.app` |
| Authorization callback URL | `https://task-flow-fullstack-crud-profession.vercel.app/api/auth/callback/github` |

3. Click **Register application**
4. Copy **Client ID** → you already have: `Ov23liEuafgNzaZAh9N5`
5. Click **Generate a new client secret**
6. Copy the secret **immediately** (shown once) → this is `AUTH_GITHUB_SECRET`

**Local callback (optional second OAuth app or extra note):**  
If you develop locally, either use a second OAuth app with:

- Homepage: `http://localhost:3000`
- Callback: `http://localhost:3000/api/auth/callback/github`

Or temporarily change the same app when testing local only.

---

## 3. Vercel Environment Variables

Vercel project → **Settings → Environment Variables** → add for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Neon pooler URL (`sslmode=require`) |
| `AUTH_SECRET` | Strong random string (same as local or new) |
| `AUTH_URL` | `https://task-flow-fullstack-crud-profession.vercel.app` |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_GITHUB_ID` | `Ov23liEuafgNzaZAh9N5` |
| `AUTH_GITHUB_SECRET` | *(from GitHub Generate secret)* |

Then: **Deployments → … → Redeploy** (check “Use existing Build Cache” **off** if env just changed).

---

## 4. Local `.env.local`

```env
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-generated-secret"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
AUTH_GITHUB_ID="Ov23liEuafgNzaZAh9N5"
AUTH_GITHUB_SECRET="paste-from-github"
```

Generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 5. Database migrations (Neon)

With `DATABASE_URL` set:

```bash
npx prisma generate
npx prisma migrate deploy
```

---

## 6. Smoke test

1. Open production site → should load (not 503)
2. **Sign in** → GitHub authorize → land on `/dashboard`
3. Create project + task
4. Open board, drag a card

---

## Security note

If database credentials or OAuth secrets were pasted into chat or a public repo, **rotate them** in Neon and GitHub after the app works.
