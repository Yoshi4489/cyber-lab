# Cyber Range — frontend

A hands-on security training platform. Users browse deliberately vulnerable
challenges, start a private target on demand, attack it through a browser or
VPN, and submit a flag for points.

## Status

The Next.js frontend preview is runnable. The independent backend lives in
[`../cyber-range-backend`](../cyber-range-backend). This repo owns the website;
the backend owns application data, scoring, and lab lifecycle.

Working: six preview lab briefings, search, category and difficulty filters,
sorting, grid/list layouts, browser bookmarks, three learning paths, responsive
navigation, a field guide, and an optional backend health check.

**Registration, live targets, downloads, flag submission, and scoring are still
being built.** Sample content is labeled in the UI. Bookmarks are local browser
preferences, not an account. Public signup stays closed until the security
launch gates are complete.

## Canonical documentation

The project keeps system decisions in a small set of root documents. The
component folders do not contain duplicate README files.

| Document | Purpose |
|---|---|
| `AGENTS.md` | Context, security rules, and working conventions. |
| `PLAN.md` | Researched stack, data model, phases, and capacity plan. |
| `ARCHITECTURE.md` | Trust zones, deployment boundaries, lifecycle, and API. |
| `SECURITY.md` | Threat model and required launch controls. |
| `docs/challenge-authoring.md` | Challenge manifest and author workflow. |
| `docs/adr/` | Decisions that should not be repeatedly revisited. |

## Repo map

```
cyber-range/
├── AGENTS.md
├── README.md
├── PLAN.md
├── ARCHITECTURE.md
├── SECURITY.md
├── docs/
│   ├── challenge-authoring.md
│   └── adr/
├── src/
│   ├── app/                 App Router pages and status API route
│   ├── components/          Portal UI and reusable primitives
│   ├── hooks/               Browser bookmark state
│   └── lib/                 Preview content and server-only backend adapter
├── tests/                   Browser tests and isolated backend fixture
└── challenges/              Existing challenge design examples
```

The empty `apps/`, `packages/`, and `infra/` directories are remnants of the
original monorepo plan. The runnable frontend is at this repository root.

## The security boundary

Users are attackers by design and are expected to gain full control of their
target. The important question is what they can reach after that happens.

1. The control plane never runs on the same host as a target.
2. Targets have default-deny egress, no private-network reachability, hard
   resource caps, short TTLs, and disposable hosts.

See `SECURITY.md` for the complete threat model.

## Why a separate orchestrator

Vercel cannot run Docker, and serverless functions are not the right place for
durable instance timers. The orchestrator is a small always-on Node service on
a VPS. It owns container lifecycle and talks to lab nodes over authenticated
Docker Engine API connections. The web app never receives Docker access.

## Quick start

Use Node.js 22 or newer (Node 24 is the development baseline).

```powershell
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. No database, account, or backend is needed to
browse the preview. Fonts and illustrations are served locally.

To check a running backend from the field guide, copy `.env.example` to
`.env.local`, set `BACKEND_URL`, and restart the frontend. The Next.js server
calls `/healthz`; the browser receives only a status. API liveness does not
mean lab spawning is available.

| Command | Purpose |
|---|---|
| `npm run dev` | Local development on port 3000. |
| `npm run build` | Production build with TypeScript checks. |
| `npm start` | Serve the production build. |
| `npm run lint` | ESLint and React rules. |
| `npm run typecheck` | Generate route types and check TypeScript. |
| `npm run test:e2e` | Desktop/mobile browser tests; run a build first. |

On a fresh machine, run `npx playwright install chromium` before browser tests.
Tests start a local production frontend on port 3100 and a test backend on
4101. They do not connect to your configured backend or launch targets.
