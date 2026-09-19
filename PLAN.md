# Development Plan: Cyber Range

## Current Status

* Phase 0 - Planning (this document)
* Phase 1 - Not started
* Phase 2 - Not started
* Phase 3 - Not started
* Phase 4 - Not started
* Phase 5 - Not started
* Phase 6 - Not started

## 1. Technical Architecture & Stack

Three deployables, because one of them has to talk to Docker and Vercel cannot.

**Web app** (`apps/web`) — the part users see.

* **Framework:** Next.js 16 App Router with TypeScript. Same as
  financial-dashboard, so the patterns carry over.
* **UI:** Tailwind CSS with shadcn/ui. Dark-first theme for this one.
* **Auth:** Better Auth, with email verification required before a user may
  spawn anything. Unverified accounts can browse but not consume compute.
* **Forms & validation:** React Hook Form with Zod.
* **Hosting:** Vercel.

**Orchestrator** (`apps/orchestrator`) — the control plane.

* **Runtime:** Node with TypeScript, Fastify for the HTTP API.
* **Container control:** Dockerode against the Docker Engine API on each lab
  node, over TLS. Never a mounted socket.
* **Queue and timers:** BullMQ on Redis. Spawn, destroy, reap, and reconcile
  are all jobs, so a crash loses nothing.
* **Hosting:** A small VPS. Always on, because instance expiry needs a real
  timer and serverless has none.

**Lab nodes** — disposable hosts that run the vulnerable targets.

* **Runtime:** Docker with user namespace remapping enabled.
* **Ingress:** Traefik, configured by container labels the orchestrator sets.
* **Hosting:** Dedicated VPS instances, rebuildable from a bootstrap script,
  holding no state worth stealing.

**Shared**

* **Database:** Neon PostgreSQL with Drizzle ORM, in `packages/db`. Both the
  web app and the orchestrator import the same schema.
* **Contracts:** Zod schemas in `packages/shared`, so the API between web and
  orchestrator is typed on both ends.
* **Testing:** Vitest for units, Playwright for end-to-end flows.

## 1.1 Researched stack decisions

The stack above is appropriate for the first release. These implementation
details were checked against the current primary documentation:

* **Next.js 16 App Router on Vercel** stays the web boundary. Vercel supports
  zero-configuration Next.js deployment, while the Docker-owning service stays
  outside Vercel.
* **Better Auth** fits the Next.js App Router. In Next.js 16, protected-route
  interception uses `proxy.ts`; authorization must still be enforced inside
  each server action and route handler.
* **Neon plus Drizzle** remains the database choice. Use the Neon HTTP driver
  for short web transactions and a serverful PostgreSQL driver where the
  orchestrator needs longer-lived or interactive database work.
* **Fastify plus TypeScript** is suitable for the narrow orchestrator API.
  Define route schemas and use the Fastify Zod type provider so validation and
  TypeScript types stay together.
* **BullMQ plus Redis** remains the lifecycle queue. Use BullMQ 6 Job
  Schedulers for reaper and reconciliation schedules; do not build new code on
  the removed legacy repeatable-job API.
* **Dockerode over mutually authenticated TLS** is the only Docker control
  path. The orchestrator must construct a fixed safe Docker configuration from
  a validated manifest rather than pass arbitrary user input to Docker.
* **Traefik's Docker provider** fits HTTP exposure because it discovers routes
  from container labels. Set `exposedByDefault=false` and add labels only for
  containers created by the orchestrator.
* **Vitest and Playwright** remain the test split: focused unit and contract
  tests in Vitest, then a real spawn-to-destroy browser flow in Playwright once
  Phase 2 exists.

Primary references: [Next.js](https://nextjs.org/docs),
[Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs),
[Better Auth](https://better-auth.com/docs/integrations/next),
[Drizzle with Neon](https://orm.drizzle.team/docs/connect-neon),
[Fastify TypeScript](https://fastify.dev/docs/latest/Reference/TypeScript/),
[BullMQ Job Schedulers](https://docs.bullmq.io/guide/job-schedulers/),
[Docker security](https://docs.docker.com/engine/security/),
[Dockerode](https://github.com/apocas/dockerode), and
[Traefik providers](https://doc.traefik.io/traefik/reference/install-configuration/providers/overview/).

## 1.2 Technology boundaries

Keep these boundaries when implementation starts:

| Boundary | Technology | Rule |
|---|---|---|
| User portal | Next.js, React, Tailwind, shadcn/ui | No Docker credentials or target host control. |
| Authentication | Better Auth | Verify sessions on the server for every protected action. |
| Control API | Fastify, TypeScript, Zod | Accept only narrow, validated lifecycle commands. |
| Durable work | BullMQ 6, Redis | Jobs must be idempotent and safe to retry. |
| Persistence | Neon PostgreSQL, Drizzle | Store intent and audit state; never plaintext flags. |
| Lab runtime | Docker, Dockerode, Traefik | Apply security defaults in code and on the host. |
| Future raw access | WireGuard | Add only after HTTP lifecycle and hardening are proven. |

## 2. Data Models (Database Schema)

Better Auth owns `user`, `session`, `account`, and `verification`. Everything
below is ours.

**`profiles`** — public identity, separate from the auth record.
`user_id`, `handle` (unique, shown on leaderboards), `display_name`,
`avatar_url`, `bio`, `country`, `total_points`, `created_at`.

**`challenges`** — the catalog.
`id`, `slug`, `title`, `description_md`, `category` (web, pwn, crypto,
forensics, reversing, network), `difficulty` (easy, medium, hard, insane),
`base_points`, `exposure` (http, tcp, vpn), `image_ref`, `author_id`, `status`
(draft, review, published, retired), `published_at`. `image_ref` is the pinned
image digest, never a floating tag.

**`challenge_files`** — downloadable attachments, such as a binary to reverse.
`id`, `challenge_id`, `filename`, `size_bytes`, `sha256`, `storage_key`.

**`flags`** — how a solve is checked.
`id`, `challenge_id`, `kind` (static or dynamic), `static_hash` for static
flags, `hmac_key_id` for dynamic ones. Never store a plaintext flag, and never
store a per-user flag at all. Dynamic flags are recomputed on submit.

**`hints`** — optional nudges that cost points.
`id`, `challenge_id`, `order`, `cost_points`, `body_md`.

**`hint_unlocks`** — who paid for what.
`user_id`, `hint_id`, `unlocked_at`. Unique on the pair.

**`instances`** — the live targets. The heart of the system.
`id`, `user_id`, `challenge_id`, `node_id`, `state` (queued, provisioning,
running, failed, destroying, destroyed), `container_id`, `internal_ip`,
`exposed_url`, `exposed_port`, `extensions_used`, `expires_at`, `created_at`,
`destroyed_at`, `failure_reason`. A partial unique index on
`(user_id, challenge_id)` where the state is live prevents double-spawns.

**`submissions`** — every attempt, right or wrong.
`id`, `user_id`, `challenge_id`, `submitted_value`, `correct`, `ip`,
`user_agent`, `created_at`. This table is the anti-cheat evidence trail, so it
records failures too.

**`solves`** — the scoring record.
`user_id`, `challenge_id`, `points_awarded`, `first_blood`, `solved_at`.
Unique on `(user_id, challenge_id)`.

**`nodes`** — the lab host registry.
`id`, `hostname`, `region`, `capacity_slots`, `used_slots`, `state` (draining,
healthy, unreachable), `last_heartbeat_at`.

**`audit_log`** — append-only, for abuse investigations.
`id`, `actor_user_id`, `action`, `target_type`, `target_id`, `metadata` jsonb,
`ip`, `created_at`.

## 3. Development Phases

### Phase 1: Catalog Without Spawning (Week 1-2)

Ship a working jeopardy-style CTF before writing a single line of container
code. This de-risks the whole project, because if the catalog, auth, scoring,
and submission loop are not solid, adding Docker on top only makes debugging
harder.

* Scaffold the Next.js app with TypeScript, Tailwind, and shadcn/ui.
* Set up Neon, wire Drizzle, and write the schema above.
* Integrate Better Auth with email verification gating.
* Build the challenge catalog: grid, filters by category and difficulty, and
  a detail page rendering the description markdown.
* Implement flag submission for static flags, with a strict rate limit and
  full submission logging.
* Build the leaderboard and public profile pages.
* Seed five file-based or purely offline challenges so the platform is
  genuinely playable at the end of this phase.

Done when someone can register, solve a crypto challenge from a downloaded
file, and see their name on the leaderboard.

### Phase 2: The Orchestrator and First Spawn (Week 3-4)

* Stand up the orchestrator service with Fastify, Redis, and BullMQ.
* Authenticate web-to-orchestrator calls with a signed service token, scoped
  and short-lived. The orchestrator trusts the token, never a user-supplied
  user id.
* Implement the lifecycle jobs: `spawn`, `destroy`, `reap`, `reconcile`.
* Provision one lab node by script, with Docker, TLS on the Engine API, and
  Traefik.
* Spawn path: pick a node with capacity, create a per-instance Docker network,
  run the pinned image with limits, attach Traefik labels, poll a health check,
  then mark the instance running.
* Expose HTTP challenges at a random subdomain under a wildcard certificate.
* Build the instance panel in the web UI: spawn button, live state, target URL,
  countdown, extend, and destroy.
* Write the reaper and reconciler as BullMQ 6 Job Schedulers that destroy
  expired instances and kill labelled containers with no live database row.

Done when a user clicks spawn, gets a private vulnerable web app at their own
URL within about twenty seconds, and it disappears on schedule.

### Phase 3: Hardening (Week 5)

This phase is not optional and is not a polish pass. Until it is finished the
platform must not be publicly reachable. Every control here is justified in
`SECURITY.md`.

* Enable user namespace remapping on lab nodes, so container root is not host
  root.
* Drop all capabilities by default, set `no-new-privileges`, apply the default
  seccomp profile, and use a read-only root filesystem with explicit tmpfs.
* Give every instance its own network, and add DOCKER-USER firewall rules that
  deny instance traffic to private ranges, the cloud metadata endpoint, and the
  control plane.
* Default-deny egress. Allow only the internal DNS resolver unless a challenge
  declares an explicit allowlist.
* Enforce memory, CPU, and PID limits per instance, a per-user concurrent
  instance cap, and a global node capacity ceiling.
* Add abuse detection on egress volume and connection count, with automatic
  instance kill and an audit log entry.
* Write the terms of service, the acceptable use policy, and an abuse contact.
  Require acceptance at registration.
* Commission an external review or a focused self-review against the threat
  model before opening signups.

### Phase 4: Scoring, Progression, and Anti-Cheat (Week 6)

* Switch to per-user dynamic flags, derived as an HMAC of the user id and
  challenge id. A shared flag is then both useless to the recipient and
  traceable to the leaker.
* Implement decaying scores, so a challenge is worth less as more people solve
  it, with a floor.
* Add first-blood recognition.
* Ship the hint system, with point costs and an explicit confirmation.
* Add flag-sharing detection: flag a solve when the submitted value derives
  from another user's key, and surface it for review rather than auto-banning.
* Build the user dashboard with solve history, category progress, and rank.

### Phase 5: Challenge Pipeline (Week 7)

Content is the product. Making it cheap to add a challenge is what keeps the
platform alive past launch.

* Define the `challenge.yml` manifest format. See
  `docs/challenge-authoring.md`, which already specifies it.
* Build the CI workflow: lint the manifest, build the image, scan it, run the
  automated solve script, and publish by digest to the registry.
* Require every challenge to ship a solve script, so regressions are caught.
* Add a health check contract that the orchestrator uses to decide when an
  instance is actually ready.
* Build the author-facing admin area for drafting and reviewing challenges.

### Phase 6: Beyond HTTP (Week 8+)

* Add WireGuard, so users can reach raw TCP services and full machines rather
  than only web apps. Each user gets a peer, each instance an address in a
  per-user subnet.
* Add an in-browser attacker workstation over Guacamole, which removes the VPN
  setup barrier that loses most beginners.
* Support multi-container challenges, so a scenario can have a web tier, a
  database, and a pivot host on one internal network.
* Evaluate Firecracker microVMs for kernel-level and privilege-escalation
  content that containers cannot host safely.

## Future Scope (Post-MVP)

* Teams, team leaderboards, and private team ranges.
* Seasons with rotating content and archived scoreboards.
* Writeups, unlocked only after a user solves the challenge themselves.
* A guided learning path that sequences challenges into courses.
* Migration from single-node Docker to Kubernetes once one node stops being
  enough, tracked in `docs/adr/0001-docker-over-kubernetes.md`.
* Certificates of completion, and an achievement system.

## Costs and Capacity

At 512 MB per instance, a 16 GB lab node holds roughly 25 concurrent
instances after leaving headroom for the host and Traefik. With a one-hour TTL
and a per-user cap of two, one node comfortably serves a few hundred casual
users. Budget one small VPS for the orchestrator, one for the first lab node,
and Neon plus Vercel on their free or entry tiers. Scale by adding lab nodes,
which the `nodes` table already accounts for.

## Sequencing Note

The phases are ordered so that the riskiest unknown, container orchestration,
lands in Phase 2 with a working product already around it, and hardening lands
in Phase 3 before any public exposure. Resist the temptation to open signups at
the end of Phase 2.
