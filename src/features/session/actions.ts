"use client";
import { getLab } from "@/features/catalog/data";
import { updateLearner } from "@/features/learner/store";

export function startSession(slug: string) {
  const lab = getLab(slug);
  if (!lab) return;
  const now = Date.now();
  updateLearner((current) => {
    if (!current.signedIn) return current;
    const existing = current.sessions[slug];
    if (existing && existing.expiresAt > now) return current;
    return {
      ...current,
      sessions: {
        ...current.sessions,
        [slug]: { startedAt: now, expiresAt: now + lab.minutes * 60_000 },
      },
    };
  });
}
export function finishSession(slug: string) {
  const now = Date.now();
  updateLearner((current) => {
    const session = current.sessions[slug];
    if (
      !current.signedIn ||
      !getLab(slug) ||
      !session ||
      session.expiresAt <= now
    )
      return current;
    const sessions = { ...current.sessions };
    delete sessions[slug];
    return {
      ...current,
      sessions,
      completions: {
        ...current.completions,
        [slug]: current.completions[slug] ?? now,
      },
    };
  });
}
export function stopSession(slug: string) {
  updateLearner((current) => {
    if (!current.signedIn) return current;
    const sessions = { ...current.sessions };
    delete sessions[slug];
    return { ...current, sessions };
  });
}
