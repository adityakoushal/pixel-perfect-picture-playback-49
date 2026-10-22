# CelebraAI — Your Intelligent Celebration Planner

An AI-powered planner for weddings, birthdays, anniversaries, corporate events, festivals and community gatherings. Enter your event details and get a concept, colour palette, itemised budget with chart, timeline, grouped checklist, vendor guidance, personalised ideas and a backup plan.

## Features
- Multi-step, validated planning form (React Hook Form + Zod)
- AI plan generation through a server function (key never reaches the browser)
- Clearly labelled **demo mode** (templates + budget rules, no AI call) when AI is unavailable
- Budget allocation computed in code — amounts always sum exactly to your total
- Spending tracker, task completion progress, edit & regenerate, print
- Plans saved in browser local storage (no account)
- Light/dark theme toggle

## Tech
TanStack Start (React 19 + TypeScript, Vite), Tailwind CSS v4, Lucide, Recharts, Vercel AI SDK via the Lovable AI Gateway.

## Structure
```
src/
  routes/                 pages (/, /features, /how-it-works, /about, /plan, /dashboard, /dashboard/$planId)
  components/             layout + marketing UI
  features/
    budget/               allocation rules + budget UI
    checklist/            task helpers
    event-planner/        demo engine, plan assembly, form widgets
  schemas/                Zod schemas (event input, plan/AI output)
  services/               AI server function, AI client (server-only), storage, error mapping
  test/                   Vitest tests
```

## Setup
Prerequisites: Bun (or Node 20+).
```
bun install
cp .env.example .env    # optional, for AI locally
bun run dev
```

### Environment variables
| Name | Where | Purpose |
| --- | --- | --- |
| `LOVABLE_API_KEY` | server only | Lovable AI Gateway key. If absent, the app offers demo mode only. |

On Lovable this key is provisioned automatically. Never prefix it with `VITE_`.

## Commands
- `bun run dev` — development server
- `bun run build` — production build
- `bun run test` — run tests (form validation, budget arithmetic, tasks, storage, AI output validation, error mapping)

## Limitations
- Plans live only in the current browser; clearing data or switching devices loses them.
- Budget figures are illustrative allocations, not market prices or quotations.
- No real vendors, reviews or availability are suggested.
