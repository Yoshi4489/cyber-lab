import { z } from "zod";
import { getLab, labs } from "@/features/catalog/data";

const username = z.string().trim().min(2).max(24).regex(/^[a-zA-Z0-9_-]+$/);
export const usernameSchema = username;
const timestamp = z.number().finite().nonnegative().max(8.64e15);
export const learnerSchema = z.object({
  version: z.literal(1),
  username: username.nullable(),
  signedIn: z.boolean(),
  completions: z.record(z.string(), timestamp),
  sessions: z.record(z.string(), z.object({ startedAt: timestamp, expiresAt: timestamp })),
});
export type Learner = z.infer<typeof learnerSchema>;
export const emptyLearner: Learner = { version: 1, username: null, signedIn: false, completions: {}, sessions: {} };

export function readLearner(raw: string | null): Learner {
  try {
    const result = learnerSchema.safeParse(JSON.parse(raw ?? "null"));
    if (!result.success) return emptyLearner;
    const data = result.data;
    return {
      ...data,
      signedIn: Boolean(data.signedIn && data.username),
      completions: Object.fromEntries(Object.entries(data.completions).filter(([slug]) => getLab(slug))),
      sessions: Object.fromEntries(Object.entries(data.sessions).filter(([slug, session]) =>
        getLab(slug) && session.expiresAt > session.startedAt)),
    };
  } catch { return emptyLearner; }
}

export function totalXp(learner: Learner) {
  return labs.reduce((sum, lab) => sum + (learner.completions[lab.slug] !== undefined ? lab.points : 0), 0);
}

// Illustrative reward rules for the UX preview; not a production scoring policy.
export const XP_PER_LEVEL = 500;
export function levelFor(xp: number) { return Math.floor(xp / XP_PER_LEVEL) + 1; }
export function localDay(time: number) {
  const date = new Date(time);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
export function activity(learner: Learner, now: number) {
  const days = new Set(Object.values(learner.completions).map(localDay));
  const cursor = new Date(now);
  const today = days.has(localDay(now));
  if (!today) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDay(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { today, streak };
}
export function badgesFor(learner: Learner) {
  const completed = labs.filter(lab => learner.completions[lab.slug] !== undefined);
  return [
    { name: "First step", description: "Finish your first demo lab", earned: completed.length >= 1 },
    { name: "Finding your flow", description: "Finish 5 different demo labs", earned: completed.length >= 5 },
    { name: "Curious mind", description: "Try all 5 topic categories", earned: new Set(completed.map(lab => lab.category)).size >= 5 },
  ];
}
