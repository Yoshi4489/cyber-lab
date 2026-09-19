# Challenge Authoring

A challenge is a folder under `challenges/`. Everything the platform needs to
build, run, score, and validate it lives in that folder and is version
controlled. Nothing is configured by clicking around in an admin panel.

```
challenges/web-001-cookie-monster/
├── challenge.yml      Manifest. The contract with the orchestrator.
├── Dockerfile         How the target is built.
├── src/               The vulnerable application itself.
├── solve.py           Automated solve. CI runs this against a real instance.
└── writeup.md         Explanation, shown only after a user solves.
```

## The manifest

`challenge.yml` is validated in CI against a Zod schema in `packages/shared`.
An invalid manifest fails the build rather than failing at spawn time in front
of a user.

```yaml
slug: web-001-cookie-monster
title: Cookie Monster
category: web              # web | pwn | crypto | forensics | reversing | network
difficulty: easy           # easy | medium | hard | insane
base_points: 100
exposure: http             # http | tcp | vpn
author: yoshi

description: |
  Markdown. Sets the scene and states the objective.
  Never hint at the vulnerability class here. That is what hints cost points for.

scope: |
  The provided instance only. Do not attack the platform, other users'
  instances, or anything outside the target URL.

image:
  context: .
  dockerfile: Dockerfile

runtime:
  port: 8080               # port inside the container that Traefik routes to
  memory_mb: 256
  cpus: 0.5
  pids: 64
  readonly_rootfs: true
  tmpfs:
    - /tmp
  cap_add: []              # empty unless justified in review
  egress: deny             # deny | allowlist
  # egress_allow:          # only with egress: allowlist, and only after review
  #   - api.example.com:443

health:
  type: http               # http | tcp
  path: /
  expect_status: 200
  timeout_seconds: 30

flag:
  kind: dynamic            # dynamic | static
  inject: env              # env sets FLAG, file writes to flag_path
  # flag_path: /flag.txt

hints:
  - cost: 10
    body: The session cookie is not as opaque as it looks.
  - cost: 25
    body: Decode it. Then consider what the server does and does not verify.
```

## Rules that are not negotiable

**Never bake the flag into the image.** Images are cached on every lab node,
pushed to a registry, and pullable by anyone who learns the name. The flag
arrives at runtime, injected by the orchestrator, which is also what makes
per-user dynamic flags possible.

**Pin the base image by digest.** A challenge that builds differently next
month is a challenge whose solve script breaks at three in the morning.

**Declare a real health check.** The orchestrator uses it to decide when to
hand the user a URL. A challenge without one gives users a dead link for the
first ten seconds and reads as a broken platform.

**Ask for nothing extra.** Empty `cap_add`, `egress: deny`, read-only root
filesystem. Every exception is a review conversation and needs a reason that
survives `SECURITY.md`. If the challenge concept requires `--privileged`, the
concept is wrong for a container and belongs on a microVM later.

**Ship a solve script.** CI spawns a real instance, runs `solve.py` against it,
and asserts that it recovers the flag. This is the only thing standing between
you and a catalog where a third of the challenges quietly stopped working.

## Difficulty, honestly

Authors systematically rate their own challenges one level too easy, because
they already know the answer. A useful correction is to watch one person who
has never seen it try for twenty minutes, then rate it based on where they got
stuck rather than where you expected them to.

* **easy** — one vulnerability, visible from the surface, no chaining.
* **medium** — either one well-hidden vulnerability, or two chained.
* **hard** — chaining required, plus something non-obvious about the
  environment.
* **insane** — a novel technique or a genuinely obscure primitive. Rare, and
  you probably have not written one.

## Review checklist

- [ ] `challenge.yml` validates
- [ ] base image pinned by digest
- [ ] no flag in the image, confirmed by grepping the built layers
- [ ] health check passes on a cold start
- [ ] `solve.py` recovers the flag against a live instance
- [ ] resource limits are tight enough for the real workload
- [ ] `cap_add` empty, or the exception is written down and approved
- [ ] `egress: deny`, or the allowlist is written down and approved
- [ ] scope statement present
- [ ] description does not give away the vulnerability class
- [ ] writeup written
