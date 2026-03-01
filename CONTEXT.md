# Coveted Collection Software — Project Context

## Stack
- **Frontend**: React 19 + Vite → GitHub Pages (`willg02.github.io/coveted-collection-software`)
- **Backend**: Express 5 + Prisma 7 + Neon PostgreSQL → Railway
- **Auth**: JWT (`cc_token` in localStorage), `authMiddleware` in `server/auth.js`
- **Repo**: willg02/coveted-collection-software

## Key Files
| File | Purpose |
|------|---------|
| `server/index.js` | Express app, route mounts, legacy mock endpoints, seed admin |
| `server/db.js` | Prisma client singleton |
| `server/auth.js` | JWT sign/verify, `authMiddleware` |
| `src/lib/apiClient.js` | All frontend API calls (single `request()` helper) |
| `src/lib/AuthContext.jsx` | Auth context + `useAuth()` hook |
| `src/layouts/AppLayout.jsx` | Sidebar + header shell |
| `prisma/schema.prisma` | Full DB schema |

## Routes (all protected except `/api/auth/*` and `/api/health`)
| Mount | File |
|-------|------|
| `/api/auth` | authRoutes.js |
| `/api/user` | userRoutes.js |
| `/api/announcements` | announcementRoutes.js |
| `/api/messages` | messageRoutes.js |
| `/api/leave` | leaveRoutes.js |
| `/api/time` | timeRoutes.js |
| `/api/tasks` | taskRoutes.js |
| `/api/properties-v2` | propertyRoutes.js |
| `/api/operations` | operationsRoutes.js |
| `/api/leads` | salesRoutes.js |
| `/api/financials` | financialRoutes.js |
| `/api/meetings` | meetingRoutes.js |
| `/api/performance` | performanceRoutes.js |
| `/api/onboarding` | onboardingRoutes.js |
| `/api/reports` | reportRoutes.js |

## Schema — Models
- **User**: id, name, email, password, role (employee/manager/admin), department
- **Announcement**, **Message** (sender/receiver), **LeaveRequest**, **TimeEntry**, **Task** (assignee/creator), **Meeting**, **PerformanceGoal**, **OnboardingStep**
- **Property**: name, address, type, status, units, beds, baths → **PropertyOrder[]**, **SetupTask[]**
- **SOP**, **ScheduleEvent** (assignee optional)
- **Lead**: name, stage (new/contacted/qualified/proposal/won/lost), value, assignee
- **Expense**, **Revenue** (both optionally linked to Property)

## Pages
| Route | File | Status |
|-------|------|--------|
| `/` | Dashboard.jsx | Live stats via `/api/reports/dashboard` |
| `/hr` | HR.jsx | 14 views, fully live |
| `/properties` | Properties.jsx | Card grid, search/filter, beds/baths, orders & setup tasks |
| `/operations` | Operations.jsx | Functional list UI (schedule + SOPs) — redesign pending |
| `/sales` | Sales.jsx | Sales & Market Analytics — 7 tabs: AI Pricing, Analysis, Training Data, History, Market Alerts, Competitive, Data Audit |
| `/financials` | Financials.jsx | Expenses + revenue CRUD |
| `/chat` | Chat.jsx | Rule-based keyword bots (ops + HR) — AI upgrade pending |
| `/login` | Login.jsx | JWT login/register |

## Roles
- `admin` — full access, sees all data in reports/leave/time
- `manager` — same elevated access
- `employee` — sees only own data

## Pending Work
1. **Operations redesign** — card grid similar to Properties
2. **AI Intelligence view** — stub exists in HR Hub
3. **Chat → OpenAI** — swap rule-based engine for real API calls
4. **Reports/Analytics** — standalone page
5. **Mobile responsiveness** polish

## Dev Commands
```bash
npm run dev        # Vite frontend (localhost:5173)
npm run server     # Express backend (localhost:3001)
npm run build      # Production frontend build
prisma generate    # Regenerate client after schema changes
prisma migrate dev # Run new migrations
```

## Notes
- Frontend proxies `/api` to `localhost:3001` in dev via Vite config
- `VITE_API_URL` set to Railway URL in `.env.production`
- Default seed admin: `will@covetedcollection.com` / `admin123`
- Legacy mock endpoints (`/api/properties`, `/api/orders`, `/api/bots`) still live in `index.js` for Chat page bots display

## Changelog
- **2026-03-01** — Financials redesign: 3-tab layout (Portfolio Overview, Payment & Payroll, Custom Reports), portfolio endpoint with property-level breakdown, employee performance report with CSV export
- **2026-03-01** — Sales redesign: replaced lead pipeline/kanban with "Sales & Market Analytics" page — 7 tabs (AI Pricing, Analysis, Training Data, History, Market Alerts, Competitive, Data Audit), localStorage for analysis history, SVG occupancy chart, stub AI features
