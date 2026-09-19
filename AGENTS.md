# AGENTS.md

Context for anyone, human or agent, picking up this repo cold. Read this
first, then `PLAN.md`.

## What this is

A hands-on security training platform. Users browse a catalog of deliberately
vulnerable challenges, spawn a private isolated target on demand, attack it,
and submit a flag to score points. Comparable to HackTheBox or TryHackMe.

Status: planning. There is no application code yet. Phase 1 in `PLAN.md` is the
entry point.

## The one fact that changes how you work on this

Users are attackers by design, and they are supposed to win against the target.
Every other app in this workspace assumes users are not hostile. This one hands
them root on a machine and scores them for taking it.

So the interesting attacks are never against the challenge. They are against
the platform hosting it. When you make a decision here, the question is not
"can a user break the target" — they are meant to — it is "what can they reach
once they have."

Two rules follow, and they are not negotiable:

1. **The control plane never shares a host with a target.** The web app,
   database, and orchestrator sit where a user with full root inside a
   container cannot reach them.
2. **Targets are guilty until proven innocent.** Default-deny egress, no
   private-network reachability, hard resource caps, short TTL, disposable
   hosts.

`SECURITY.md` is the long form and is required reading before touching
anything in `apps/orchestrator` or `infra/`.

## Map

| Path | What it is | Trust |
|---|---|---|
| `apps/web` | Next.js 16 on Vercel. Catalog, auth, scoring, UI. | Trusted, unprivileged |
| `apps/orchestrator` | Fastify plus BullMQ. Owns container lifecycle. | Trusted, highly privileged |
| `packages/db` | Drizzle schema, shared by both services. | — |
| `packages/shared` | Zod contracts and the challenge manifest schema. | — |
| `challenges/` | Challenge-as-code. One folder each. | Hostile by design |
| `infra/` | Traefik config, lab node bootstrap. | Semi-trusted |

The orchestrator is the only component holding Docker Engine API credentials,
which is effectively root on a lab node. Keep it small enough to audit in an
afternoon. When in doubt, put logic in `apps/web` instead.

## Stack

Matches `financial-dashboard` deliberately, so patterns carry over: Next.js 16
App Router, TypeScript, Tailwind, shadcn/ui, Drizzle on Neon Postgres, Better
Auth, React Hook Form with Zod, Vitest and Playwright.

New to this project: Fastify, BullMQ on Redis, Dockerode, Traefik.

## Documents

Keep the canonical documentation set small. Fold new material into an existing
document rather than adding a new top-level guide.

* `README.md` — what the project is, repo map.
* `AGENTS.md` — this file. Context and conventions.
* `PLAN.md` — phases, schema, capacity. The build order.
* `ARCHITECTURE.md` — trust zones, instance lifecycle, flag model, API contract.
* `SECURITY.md` — threat model and the controls that answer it.
* `docs/challenge-authoring.md` — how to author and ship a challenge.
* `docs/adr/` — decision records. Add one when a choice would otherwise be
  re-litigated in six months.

## Working rules

**Do not open public signups before Phase 3 finishes.** Every control marked
required in `SECURITY.md` blocks launch. None of them are polish.

**Never bake a flag into an image.** Images are cached, pushed, and pullable.
Flags are injected at runtime, which is also what makes per-user dynamic flags
work.

**Never run a target privileged, and never mount a Docker socket into one.**
There is no challenge design that justifies either. If a concept seems to need
it, the concept belongs on a microVM in Phase 6, not on a shared kernel today.

**The orchestrator reads the user id from the signed service token only.**
Taking it from a request body is a straight authorization bypass.

**Pin images by digest.** A challenge that builds differently next month is a
challenge whose solve script breaks at three in the morning.

## Commit and push conventions

Optimize for one thing: when something breaks, the commit that broke it should
be obvious and revertable on its own. Many small commits are good. One large
commit is not.

**Format.** `type(scope): summary in the imperative`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `security`.
Scopes: `web`, `orchestrator`, `db`, `shared`, `challenges`, `infra`, `docs`.

```
feat(orchestrator): add spawn job with per-instance network
fix(web): check instance ownership before allowing destroy
docs(security): add egress controls checklist
```

**One logical change per commit.** If the message needs the word "and", it is
two commits. A commit that touches the schema, the API, and the UI is three
commits, in that order.

**Every commit stands alone.** It should build and pass tests by itself, so
`git bisect` actually finds the culprit. A commit that only works once the next
one lands defeats the entire point.

**Split these apart, always.**

* Schema migration and the code that uses it. Migrations are hard to revert,
  and separating them means you can roll back behavior without rolling back
  the database.
* Refactor and behavior change. Mixing them hides the real diff inside noise.
* Formatting and logic. Never in the same commit.
* Dependency bumps and feature work.

**Push in groups, not all at once.** Land one logical group, push it, let CI
report, then move to the next. Pushing twenty commits in a single shot means a
red build tells you almost nothing about which of the twenty caused it. This
is the whole reason the commits were kept small.

A reasonable rhythm for one feature:

```
push 1   db:            schema and migration for instances
push 2   shared:        zod contract for the instance API
push 3   orchestrator:  spawn, health check, destroy
push 4   orchestrator:  reaper and reconciler
push 5   web:           instance panel UI
push 6   test:          e2e spawn-to-destroy flow
```

Six pushes, each independently verifiable. If push 4 goes red, you know it is
the reaper without reading a diff.

**Never commit.** Secrets, `.env` files, TLS keys or certificates, `acme.json`,
plaintext flags, or anything under `certs/`. The `.gitignore` covers these, but
it is a backstop and not a substitute for looking at what you staged.

**Write the body when the why is not obvious.** The summary says what changed.
If a reviewer would ask "why this way," answer it in the body. Security
decisions always get a body.
