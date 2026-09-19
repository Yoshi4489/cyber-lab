# Cyber Range

A hands-on security training platform. Users browse deliberately vulnerable
challenges, start a private target on demand, attack it through a browser or
VPN, and submit a flag for points.

## Status

Planning. There is no application code yet. Read `PLAN.md`, then
`ARCHITECTURE.md`, then `SECURITY.md` before implementation.

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
├── apps/
│   ├── web/                 Next.js user portal
│   └── orchestrator/        Fastify control plane for lab lifecycle
├── packages/
│   ├── db/                  Drizzle schema and migrations
│   └── shared/              Zod contracts and challenge manifest schema
├── challenges/              Challenge-as-code, one folder per challenge
└── infra/                   Lab-node bootstrap, Docker, and Traefik
```

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

Nothing runs yet. Phase 1 in `PLAN.md` builds the catalog and scoring loop
before container spawning is introduced.
