# TaskFlow — Fullstack CRUD Professional Web App

Developed and verified by [Softbridge Solutions](https://softbridge-solutions-main-web-app-iota.vercel.app).

> Modern task management SaaS with Kanban drag-and-drop, analytics dashboard, and **client-only smart features** — no external AI APIs.


**GitHub:** [TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP](https://github.com/Dpehect/TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP)  
**Production:** [task-flow-fullstack-crud-profession.vercel.app](https://task-flow-fullstack-crud-profession.vercel.app)

---

## Project Description

**TaskFlow** is a full-stack task management app: GitHub OAuth login, projects & tasks CRUD, a three-column Kanban board with drag-and-drop, a dashboard with charts/filters, and smart client-side helpers (task breakdown, due labels, productivity score).

---

## Key Features

- GitHub OAuth (Auth.js v5 + Prisma Adapter + Neon)
- Projects & tasks **full CRUD**
- Kanban board (To Do / In Progress / Done) with **@dnd-kit**
- Dashboard stats, Recharts, search & filters
- Smart Break Down, due labels, productivity score (no AI APIs)
- Dark mode, skeletons, empty states, toasts

---

## Tech Stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · Auth.js v5 · Prisma 6 · Neon Postgres · @dnd-kit · Recharts · Zod · react-hook-form · Framer Motion · sonner

---

## Screenshots

Add captures under `docs/screenshots/` (dashboard, kanban, smart break down, login).

---

## Local setup

### 1. Clone & install

```bash
git clone https://github.com/Dpehect/TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP.git
cd TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP
npm install
```

### 2. Environment (`.env.local`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
AUTH_SECRET="paste-generated-secret"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"
```

Generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. GitHub OAuth (local)

- Homepage: `http://localhost:3000`
- Callback: `http://localhost:3000/api/auth/callback/github`

### 4. Database

```bash
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon pooler connection string |
| `AUTH_SECRET` | Auth.js signing secret |
| `AUTH_URL` | App origin (`http://localhost:3000` or production URL) |
| `AUTH_TRUST_HOST` | Set `true` on Vercel |
| `AUTH_GITHUB_ID` | GitHub OAuth Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth Client Secret |

Never commit `.env` / `.env.local`.

---

## Deployment (Vercel)

Full guide: **[docs/DEPLOY.md](docs/DEPLOY.md)**

1. Import GitHub repo on Vercel  
2. Set all env vars (especially `AUTH_SECRET`, `DATABASE_URL`, GitHub OAuth)  
3. Production OAuth callback:  
   `https://task-flow-fullstack-crud-profession.vercel.app/api/auth/callback/github`  
4. Redeploy after env changes  
5. `npx prisma migrate deploy` against Neon (once)

**503 tip:** Almost always missing `AUTH_SECRET` or `DATABASE_URL` on Vercel.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:studio` | Prisma Studio |

---

## Architecture

```text
src/app/           pages (login, dashboard, board)
src/components/    kanban, dashboard, forms, ui
src/lib/actions/   server actions (CRUD, reorder)
src/lib/auth*.ts   Auth.js (Edge config + Node handlers)
prisma/            schema + migrations
```

---

## Portfolio blurb

TaskFlow is a full-stack task manager with GitHub OAuth, Neon Postgres, Kanban drag-and-drop, analytics, and client-side smart features without paid AI APIs. Built with Next.js 15, Prisma, Auth.js, and Tailwind/shadcn.

---

MIT · Portfolio project
