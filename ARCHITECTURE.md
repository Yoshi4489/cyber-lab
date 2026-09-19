# Architecture

## Current frontend boundary

The Next.js application is at this repository root (`src/app`). The backend is
an independent sibling repository, `../cyber-range-backend`. The rest of this
document describes the intended full platform.

```text
Browser -> Next.js portal -> Backend HTTP API -> Database / lifecycle queue
                               Privileged worker -> mTLS -> Disposable lab nodes
```

Pages render typed sample content from `src/lib/catalog.ts`. Search, filters,
sorting, and layout run in the catalog client component. Saved slugs use
`cyber-range:saved-labs:v1` in local storage; preferences never establish user
identity. Route shells and briefings use Server Components; interaction and
browser storage components opt into the client boundary.

`GET /api/backend-status` calls the server-only adapter in `src/lib/backend.ts`.
It requests the fixed `/healthz` path at `BACKEND_URL`, validates the response
with Zod, rejects redirects, and times out after three seconds. It returns only
`{ status: "not-configured" | "reachable" | "unavailable" }`, with no cache.
The URL is deployment configuration, never browser input. Production remote
connections require HTTPS. This checks API liveness, not database, queue,
session, or target readiness.

The field guide checks on demand. The frontend still shows preview content
even if the API is reachable. The backend's `/v1/challenges` is a scaffold;
production catalog compatibility is not claimed.

### Connecting the next features

1. Agree a versioned catalog schema: public challenge ID, slug, title, category,
   difficulty, description, objectives, prerequisites, tags, duration, points,
   and actual availability. Validate on the server and handle unavailable data
   explicitly. Never expose image references, internal IPs, or flag material.
2. Implement server-verified sessions before protected actions. Better Auth is
   planned; its storage integration is part of that implementation.
3. After session and email verification, the Next.js server may mint a short-lived,
   scoped service token with identity in `sub`. Keep the signing secret outside
   browser bundles. The backend verifies identity, scope, ownership, and quotas.
4. Send lifecycle and submission commands through server handlers/actions.
   Browser-supplied user IDs are not authority. Launch stays disabled until
   the full authorized path exists.
5. Publish contracts as a versioned artifact or generated types. Sibling source
   imports must not be required to build either repository.

No credentials are needed for the UI preview. The frontend holds no Docker
credentials and makes no Docker calls.

## Topology

Three trust zones. The boundary between them is the whole design.

```
                    ┌─────────────────────────────────────┐
   Users ──────────▶│  ZONE 1  CONTROL PLANE (trusted)    │
                    │                                     │
                    │  Next.js on Vercel                  │
                    │  Neon Postgres                      │
                    │  Orchestrator + Redis on a VPS      │
                    └──────────────┬──────────────────────┘
                                   │ Docker Engine API over mTLS
                                   │ outbound only, control plane dials out
                    ┌──────────────▼──────────────────────┐
                    │  ZONE 2  LAB NODES (semi-trusted)   │
                    │                                     │
                    │  Docker daemon, Traefik ingress     │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
   Users ──────────▶│  ZONE 3  INSTANCES (hostile)        │
   attack traffic   │                                     │
   via Traefik      │  One container per user per         │
   or VPN           │  challenge, own network, no egress  │
                    └─────────────────────────────────────┘
```

A user who achieves full root inside Zone 3 has reached a disposable container
on a disposable host with no credentials, no private-network reachability, and
no path to Zone 1. That outcome is the design target, and `SECURITY.md`
enumerates the controls that produce it.

The control plane dials out to lab nodes. Lab nodes never initiate connections
to the control plane, which means a compromised node cannot reach the database
even if it recovers a credential.

## Why the orchestrator exists

Three constraints force a separate always-on service.

* Vercel cannot run Docker, and the web app is on Vercel.
* Instance expiry needs a durable timer. Serverless functions do not hold one,
  and a cron that fires every minute against a serverless endpoint is a worse
  version of what BullMQ already does well.
* The Docker Engine API is effectively root on the host. Exactly one service
  should hold that capability, and it should be small enough to audit.

## Technology placement

The stack is split by trust and runtime responsibility:

| Component | Runs on | Technology | Access it holds |
|---|---|---|---|
| Web portal | Vercel | Next.js 16, Better Auth, Drizzle, Zod | User sessions and application data |
| Database | Neon | PostgreSQL | Application records and audit data |
| Orchestrator | Separate VPS | Fastify, BullMQ 6, Redis, Dockerode | Docker Engine API over mTLS |
| Lab node | Dedicated disposable VPS | Docker, Traefik, host firewall | Vulnerable targets and public ingress |
| Shared contracts | Versioned artifact across repos (planned) | Zod schemas / generated types | Request and response validation |

The web portal can request lifecycle operations but cannot create containers.
The orchestrator can create containers but receives only a signed service token
with the authenticated user id. Lab nodes accept outbound control connections
from the orchestrator and hold no database or web credentials.

## Instance lifecycle

The state machine is deliberately explicit, because every failure mode here
either strands a user without a target or leaks a container that runs forever.

```
  queued ──▶ provisioning ──▶ running ──▶ destroying ──▶ destroyed
     │             │             │             ▲
     │             │             └─────────────┘
     │             │              TTL expiry, user destroy,
     │             │              or abuse kill
     └─────────────┴──▶ failed ──────────────────┘
```

**Spawn.** The web app verifies the session and sends an authorized command to
the backend. The backend checks the concurrent instance quota, inserts an
`instances` row in `queued`, and enqueues a job
keyed on `user:challenge` so a double-click cannot produce two containers. A
partial unique index on live states enforces the same rule at the database
level, because the idempotency key alone is not a guarantee.

**Provision.** A worker claims the job, picks a healthy node with free
capacity, creates a dedicated Docker network for the instance, derives the
user's flag, and starts the pinned image digest with resource limits, dropped
capabilities, and Traefik routing labels. The flag is injected at runtime as an
environment variable or a mounted file. It is never baked into the image,
because images are cached, shared, and pullable.

**Health.** The worker polls the health check the challenge manifest declares,
up to a timeout. Only when the check passes does the instance become `running`
with `expires_at` set to one hour out. Marking it running on container start
instead would hand users a URL that returns connection-refused for the first
ten seconds, which reads as a broken platform.

**Serve.** The web UI polls instance state, then shows the target URL and a
countdown. The user may extend by thirty minutes up to three times, capping a
session at two and a half hours, and may destroy early.

**Reap.** A BullMQ 6 Job Scheduler runs every thirty seconds, sweeps expired
instances, and destroys the container, network, and route.

**Reconcile.** A slower loop, once a minute, compares intent against reality in
both directions. A labelled container with no live database row is an orphan
and gets killed. A database row marked running whose container has vanished is
marked failed. Without this loop, every orchestrator crash leaks compute
permanently.

## The flag model

Static flags are a scoring bug waiting to happen, because the first solver can
paste the answer into a group chat and the leaderboard stops meaning anything.

Per-user dynamic flags fix it. The flag is
`HMAC-SHA256(server_secret, user_id || challenge_id)`, truncated and wrapped as
`RANGE{...}`. Three properties follow:

* Nothing per-user is stored. Verification recomputes the expected value.
* A leaked flag does not work for the person who receives it.
* A submitted flag that does not match the submitter but does match another
  user identifies both parties, which turns flag sharing from undetectable into
  self-reporting.

Detection should raise a review item rather than auto-ban. Shared accounts,
classroom use, and coincidence all exist.

## Exposure modes

The challenge manifest declares one of three, and the mode determines how a
user reaches the target.

**http** — Traefik routes `https://<random-id>.lab.example.com` to the
container, under a wildcard certificate issued by DNS-01. The random subdomain
is unguessable, so instances are not enumerable. This covers the majority of
web challenges and needs no client setup at all, which matters more than it
sounds like for beginner retention.

**tcp** — The orchestrator allocates a port from a reserved range and publishes
`lab.example.com:PORT`. This covers binary exploitation and anything spoken
over a raw socket.

**vpn** — The instance receives an address on the user's WireGuard subnet and
is reachable only through their tunnel. This is the mode for full-machine
challenges with SSH, SMB, or a Windows target, and it arrives in Phase 6
because the setup friction is real and should not block launch.

## Web to orchestrator contract

The web app calls the orchestrator over HTTPS with a short-lived signed service
token. The critical rule is that the token carries the authenticated user id as
a signed claim, and the orchestrator reads the user id from the token only.
Accepting a user id from the request body would let anyone with a token spawn
as anyone, which is a straight authorization bypass.

Endpoints are narrow on purpose:

```
POST   /v1/instances          { challengeId }   -> { instanceId, state }
GET    /v1/instances/:id                        -> full instance state
POST   /v1/instances/:id/extend                 -> { expiresAt }
DELETE /v1/instances/:id                        -> { state }
GET    /v1/nodes/health                         -> operator only
```

Request and response shapes must be versioned across the two repositories.
Generated types and runtime validation should catch incompatible changes
before production. This contract work is still planned.

## Scoring

Decaying scores keep a challenge meaningful over time. Value starts at
`base_points`, decreases as solves accumulate, and stops at a floor around
thirty percent of base. First blood earns recognition on the challenge page.
Hint purchases subtract from the award at solve time, not immediately, so a
user who buys a hint and never solves loses nothing.

Recomputing the leaderboard on every solve is fine early and becomes a problem
around the point where solves outpace a few per second. The fix at that stage
is a materialized view refreshed on a schedule, not a rewrite.

## What runs where, at a glance

| Concern | Lives in | Why |
|---|---|---|
| Auth, catalog, scoring UI | Next.js on Vercel | Stateless, edge-cached, no privileged access |
| Domain schema and migrations | Backend repository | Owned by the API and orchestrator |
| Container lifecycle | Orchestrator VPS | Needs Docker API and durable timers |
| Vulnerable targets | Lab nodes | Disposable, isolated, rebuildable |
| Ingress and TLS | Traefik on lab nodes | Configured by labels the orchestrator sets |
