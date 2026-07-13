# TaskFlow — Fullstack CRUD Professional Web App

> Modern task management SaaS with Kanban drag-and-drop, analytics dashboard, and **client-only smart features** — no external AI APIs required.

**Repository:** [TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP](https://github.com/Dpehect/TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP)

---

## Project Description

**TaskFlow** is a full-stack task management application built as a portfolio-grade product. Users sign in with GitHub, create projects, organize work on a three-column Kanban board, track progress on a dashboard with charts and filters, and use lightweight “smart” helpers (task breakdown, due labels, productivity score, title suggestions) that run entirely in the browser.

The app emphasizes clean architecture, TypeScript safety, server actions with ownership checks, and a polished UX (loading skeletons, empty states, toasts, dark mode).

---

## Features

### Core
- **GitHub OAuth** authentication (Auth.js v5 + Prisma Adapter)
- **Projects CRUD** — create workspaces with color accents
- **Tasks CRUD** — title, priority, due date, status
- **3-column Kanban** — To Do · In Progress · Done with **@dnd-kit** drag & drop
- Optimistic board updates with rollback + toast on failure
- **Dashboard** — stats cards, Recharts (status pie + priority bar)
- **Search & filters** — query, project, status, priority, due window
- **Dark mode** (next-themes)
- Responsive layout (mobile → desktop)

### Smart client-side features (no external APIs)
| Feature | Description |
|--------|-------------|
| **Smart Break Down** | Suggests 3–4 sub-tasks from the title using keyword rules |
| **Due labels** | Overdue / Due Soon (≤3 days) / On Track |
| **Productivity Score** | `(completed / total) × 100` with light overdue penalty |
| **Title suggestions** | Similar existing titles while creating a task |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui + lucide-react |
| Auth | Auth.js v5 (NextAuth) + GitHub OAuth |
| Database | PostgreSQL (Neon free tier) + Prisma 6 |
| DnD | @dnd-kit (core, sortable, utilities) |
| Charts | Recharts |
| Forms | Zod + react-hook-form |
| Motion | Framer Motion |
| Toasts | sonner |
| Theming | next-themes |

---

## Screenshots / Demo

> Add screenshots after running the app locally. Suggested captures:

1. **Landing + Login** — GitHub sign-in card  
2. **Dashboard** — stats, productivity ring, charts, filters  
3. **Kanban board** — three columns with priority & due badges  
4. **Smart Break Down** — modal with suggested sub-tasks  
5. **Create task** — validation + similar-title chips  

Place images under `docs/screenshots/` and embed:

```md
![Dashboard](docs/screenshots/dashboard.png)
![Kanban](docs/screenshots/kanban.png)
```

**Live demo:** deploy when ready (Vercel + Neon + production GitHub OAuth callback).

---

## Getting Started (local)

### Prerequisites
- Node.js 20+
- npm
- Free [Neon](https://console.neon.tech) Postgres database
- GitHub OAuth App ([Developer Settings](https://github.com/settings/developers))

### 1. Clone & install

```bash
git clone https://github.com/Dpehect/TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP.git
cd TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP
npm install
```

### 2. Environment variables

Copy the example file:

```bash
cp .env.example .env
```

Fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
AUTH_SECRET="generate-a-long-random-string"
AUTH_URL="http://localhost:3000"
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"
```

Generate `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**GitHub OAuth App (local):**
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 3. Database migrate

```bash
npx prisma migrate dev --name init
# or if schema is already migrated:
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:studio` | Prisma Studio |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon / Postgres connection string |
| `AUTH_SECRET` | Yes | Auth.js encryption/signing secret |
| `AUTH_URL` | Yes | App origin (`http://localhost:3000` locally) |
| `AUTH_GITHUB_ID` | Yes | GitHub OAuth Client ID |
| `AUTH_GITHUB_SECRET` | Yes | GitHub OAuth Client Secret |

Never commit `.env`. Only `.env.example` is tracked.

---

## Database (Neon production notes)

1. Create a Neon project and copy the **pooled** or standard connection string with `sslmode=require`.
2. Run migrations against that database:

```bash
# with production DATABASE_URL in the shell
npx prisma migrate deploy
```

3. Prefer `migrate deploy` in CI/production (not `migrate dev`).
4. Keep a separate Neon branch/database for local development if possible.

Prisma schema lives in `prisma/schema.prisma` (Auth models + Project/Task domain).

---

## Deployment (optional — Vercel)

Vercel is optional. When you want production:

1. Push this repo to GitHub (already configured).
2. Import the repo in [Vercel](https://vercel.com).
3. Set env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (production URL), `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.
4. Update GitHub OAuth callback to:  
   `https://YOUR_DOMAIN/api/auth/callback/github`
5. Build command: `prisma generate && next build` (or rely on `postinstall`: `prisma generate`).
6. After first deploy, run `npx prisma migrate deploy` against the production DB if migrations were not applied.

---

## Architecture (high level)

```text
src/
  app/                  # App Router pages (auth, dashboard, board)
  components/
    kanban/             # DnD board
    dashboard/          # Analytics UI
    projects/ | tasks/  # Forms & smart UI
    ui/                 # shadcn primitives
  lib/
    actions/            # Server Actions (CRUD, reorder, dashboard)
    auth*.ts            # Auth.js (JWT + edge middleware config)
    smart.ts            # Client-only smart algorithms
    validations.ts      # Zod schemas
  types/                # Shared TS types
prisma/                 # Schema & migrations
```

- **Server Components** fetch data; **Client Components** handle DnD, filters, forms.
- **JWT sessions** keep middleware Edge-safe; Prisma runs on the server only.
- Task ownership is enforced via `project.userId` checks in server actions.

---

## What I learned / Challenges

- Splitting Auth.js config for **Edge middleware** vs Node Prisma adapter  
- Multi-container **@dnd-kit** with optimistic updates and batch reorder  
- Serializing dates safely from RSC → client (`ClientTask`)  
- Designing “smart” features that feel useful **without** LLM API keys  
- Keeping UX consistent: skeletons, empty states, toasts, dark mode  

---

## Portfolio summary (copy-paste)

**TaskFlow** is a full-stack task management web app built with Next.js 15, TypeScript, Prisma, Neon Postgres, and Auth.js (GitHub OAuth). It includes project and task CRUD, a production-style Kanban board with drag-and-drop (@dnd-kit), and a dashboard with Recharts analytics plus multi-criteria filtering.

Beyond CRUD, the product ships client-side smart helpers—sub-task breakdown from titles, automatic due-date labels, a productivity score, and similar-title suggestions—implemented with pure JavaScript rules so the demo runs without paid AI keys. The codebase focuses on clean architecture, server-action ownership checks, and polished UX suitable for real portfolio review.

Stack: Next.js App Router, Tailwind + shadcn/ui, Prisma/Neon, Auth.js, Framer Motion, Zod, react-hook-form.

---

## License

MIT — feel free to fork for learning and portfolio use.

---

**Built as a multi-phase portfolio project · TaskFlow**
