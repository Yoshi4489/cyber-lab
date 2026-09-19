# Cyber Range

A hands-on security training platform. Users browse a catalog of deliberately
vulnerable challenges, spawn a private isolated instance of a target on demand,
attack it in their browser or over VPN, and submit a flag to score points.

Think HackTheBox / TryHackMe, built on the same stack as the other apps in this
workspace.

## Status

Planning. No code yet. Read `PLAN.md` first, then `ARCHITECTURE.md`, then
`SECURITY.md`.

## Repo map

```
cyber-range/
├── PLAN.md                  Phased build plan. Start here.
├── ARCHITECTURE.md          System design, instance lifecycle, data model.
├── SECURITY.md              Threat model and the controls that answer it.
├── docs/
│   ├── challenge-authoring.md   How to write and ship a challenge.
│   └── adr/                     Architecture decision records.
├── apps/
│   ├── web/                 Next.js app. Catalog, auth, scoring, UI.
│   └── orchestrator/        Always-on control plane. Talks to Docker.
├── packages/
│   ├── db/                  Drizzle schema and migrations.
│   └── shared/              Zod contracts shared by web and orchestrator.
├── challenges/              Challenge-as-code. One folder per challenge.
└── infra/                   Traefik config, compose files, host bootstrap.
```

## The one thing that makes this project different

Every other web app you build assumes users are not hostile. This one hands
them a machine and asks them to break it. That inverts the usual threat model:
the interesting attacks are not against the target, they are against the
platform that hosts the target.

Two rules follow from that, and they drive most of the architecture:

1. **The control plane never runs on the same host as a target.** The Next.js
   app, the database, and the orchestrator live on infrastructure that a user
   who fully owns a target container still cannot reach.
2. **Targets are guilty until proven innocent.** Default-deny egress, no
   private-network reachability, hard resource caps, short TTL, disposable
   hosts.

`SECURITY.md` works through the rest.

## Why a separate orchestrator instead of doing it in Next.js

Vercel cannot run Docker, and serverless functions cannot hold the long-lived
timers that expire instances. The orchestrator is a small always-on Node
service on a VPS that owns all container lifecycle. The web app talks to it
over an authenticated HTTP API and never touches a Docker socket.

## Quick start

Nothing to run yet. Phase 1 in `PLAN.md` scaffolds the web app and ships the
catalog with static challenges, before any container spawning exists.
"# cyber-lab" 
