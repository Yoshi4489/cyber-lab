# ADR 0001: Single-node Docker instead of Kubernetes

**Status:** Accepted
**Date:** 2026-09-19

## Context

The platform must spawn isolated vulnerable containers per user, on demand,
with network isolation, resource limits, and automatic expiry. Kubernetes does
all of this natively through namespaces, NetworkPolicy, ResourceQuota, and job
TTLs, and it is what every large training platform eventually runs.

## Decision

Start with Docker driven by Dockerode from a single orchestrator, against a
small pool of lab nodes. Do not start with Kubernetes.

## Reasoning

The isolation primitives that actually matter here are kernel features, not
Kubernetes features. User namespaces, seccomp, capability dropping, and
netfilter rules are what contain a hostile container, and Docker exposes all of
them directly. Kubernetes would wrap the same primitives in a control plane
that is itself a large attack surface, on a project whose central risk is
attack surface.

The operational argument points the same way. A single VPS running Docker is
one thing to secure, patch, and reason about. A cluster adds an API server, a
scheduler, a CNI, an ingress controller, and RBAC, each of which is a component
that can be misconfigured into a pivot path. Running that before there is a
single user is paying a large complexity cost against a scaling problem that
does not exist yet.

Capacity confirms the timeline is comfortable. At 512 MB per instance, one
16 GB node holds roughly 25 concurrent targets. With a one hour TTL and a
two-instance per-user cap, that serves a few hundred casual users. Adding a
second and third node is a row in the `nodes` table and a bootstrap script run,
not an architecture change.

## Consequences

The `nodes` table and node selection logic exist from Phase 2, so multi-node is
a capacity decision rather than a rewrite.

Scheduling is ours to write. It is one query for the healthiest node with free
slots, which is the right amount of scheduler for this workload.

Multi-container challenges in Phase 6 need per-instance compose-style
orchestration that Kubernetes would have given free. This is accepted, and the
work is bounded because the instance-to-network mapping already exists.

## Revisit when

Any of these becomes true:

* One node is consistently at capacity and adding nodes has become routine toil.
* Instances need to survive node failure, which they currently do not and
  should not.
* Multi-container challenges dominate the catalog rather than being a minority.

At that point migrate, with the `nodes` abstraction and the per-instance
network model already shaped to fit.
