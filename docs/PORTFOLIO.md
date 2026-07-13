# TaskFlow — Portfolio Presentation Guide

## Elevator pitch (30 seconds)

> “TaskFlow is a full-stack task manager I built with Next.js and Postgres. Users sign in with GitHub, manage projects on a drag-and-drop Kanban board, and use a dashboard with charts and filters. I also added client-side smart features—like breaking a task into sub-tasks—without any external AI APIs.”

---

## Points to highlight in interviews

1. **Fullstack ownership** — Auth, DB schema, server actions, UI, deployment readiness  
2. **Clean architecture** — App Router layers, typed server actions, shared Zod schemas  
3. **Drag & drop** — Multi-column Kanban with optimistic UI and persisted order/status  
4. **Smart client features** — Rule-based breakdown, due labels, productivity score  
5. **Modern stack** — Next.js 15, Auth.js v5, Prisma, Neon, shadcn/ui, Recharts  
6. **Product polish** — Dark mode, skeletons, empty states, toasts, responsive layout  

---

## LinkedIn project blurb

**TaskFlow — Fullstack Task Management App**

Built a portfolio SaaS-style task manager with GitHub OAuth, Neon Postgres, Kanban drag-and-drop, analytics dashboard, and client-only smart features (sub-task suggestions, due labels, productivity score). Stack: Next.js 15, TypeScript, Prisma, Auth.js, Tailwind, shadcn/ui.

🔗 GitHub: https://github.com/Dpehect/TaskFlow-FULLSTACK-CRUD-PROFESSIONAL-WEB-APP

---

## Suggested README screenshots (manual)

Run `npm run dev`, then capture:

| File | Scene |
|------|--------|
| `docs/screenshots/01-landing.png` | Landing hero |
| `docs/screenshots/02-dashboard.png` | Stats + productivity + charts |
| `docs/screenshots/03-kanban.png` | Full board with cards |
| `docs/screenshots/04-smart-breakdown.png` | Break down modal |
| `docs/screenshots/05-create-task.png` | Task form + suggestion chips |

Then embed them in the main README.

---

## Talking about challenges

- **Auth on Edge:** JWT sessions so middleware doesn’t need Prisma on Edge  
- **DnD + DB:** Batch reorder action keeps column order consistent after multi-card moves  
- **No AI keys:** Keyword/template engine for “smart” UX that still demos well  
