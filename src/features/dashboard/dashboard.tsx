"use client";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Check,
  Clock3,
  FlaskConical,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { labs } from "@/features/catalog/data";
import { LabCard } from "@/features/catalog/lab-card";
import { activity, badgesFor } from "@/features/learner/model";
import { DemoNotice } from "@/features/learner/demo-notice";
import { useLearner } from "@/features/learner/store";
import { useClock } from "@/hooks/use-clock";
import { LearningArt } from "./learning-art";
import { ProgressOverview } from "./progress-overview";
import { SkillProgress } from "./skill-progress";
import styles from "./dashboard.module.css";

export function Dashboard() {
  const { learner, ready } = useLearner();
  const now = useClock();
  if (!ready) return <p role="status">Getting your demo ready…</p>;
  if (!learner.signedIn)
    return (
      <section className={styles.guest}>
        <FlaskConical size={36} />
        <h1>Your next chapter starts here.</h1>
        <p>Choose a demo username to explore your learning dashboard.</p>
        <Button asChild>
          <Link href="/signup">
            Join the demo <ArrowRight size={16} />
          </Link>
        </Button>
        <Link href="/labs">Or browse the sample labs →</Link>
      </section>
    );
  const next =
    labs.find(
      (lab) =>
        lab.difficulty === "Easy" &&
        learner.completions[lab.slug] === undefined,
    ) ?? labs.find((lab) => learner.completions[lab.slug] === undefined);
  const active = labs.filter(
    (lab) => (learner.sessions[lab.slug]?.expiresAt ?? 0) > now,
  );
  const { today } = activity(learner, now);
  return (
    <div className={styles.dashboard}>
      <header className={styles.heading}>
        <div>
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h1>
            Hey, {learner.username}
            <span className="accent">.</span>
          </h1>
          <p>A little practice today. A little more confidence tomorrow.</p>
        </div>
        <span className={styles.label}>
          <Sparkles size={14} /> Let’s keep growing
        </span>
      </header>
      <ProgressOverview learner={learner} now={now} />
      <div className={styles.columns}>
        <div className={styles.mainColumn}>
          <section className={styles.recommendation}>
            <div className={styles.recommendCopy}>
              <span className={styles.kicker}>
                <Sparkles size={14} /> YOUR NEXT SMALL WIN
              </span>
              <h2>{next ? next.title : "Look how far you've come."}</h2>
              <p>
                {next
                  ? "A good place to begin. Get familiar with the basics and find your rhythm, one step at a time."
                  : "You explored every sample lab. Revisit a favorite or see your progress on the leaderboard."}
              </p>
              {next && (
                <div className={styles.heroMeta}>
                  <span>{next.difficulty}</span>
                  <span>
                    <Clock3 size={14} /> {next.minutes} min
                  </span>
                  <span>+{next.points} demo XP</span>
                </div>
              )}
              <Button asChild>
                <Link href={next ? `/labs/${next.slug}` : "/labs"}>
                  {next ? "View lab" : "Explore labs"}
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
            <LearningArt />
          </section>
          {active.length > 0 && (
            <section className={styles.panel}>
              <h2>Your active demos</h2>
              {active.map((lab) => (
                <Link
                  className={styles.activeSession}
                  key={lab.slug}
                  href={`/labs/${lab.slug}/session`}
                >
                  <FlaskConical size={19} />
                  <span>
                    {lab.title}
                    <small>Simulated session · resume where you left off</small>
                  </span>
                  <ArrowRight size={18} />
                </Link>
              ))}
            </section>
          )}
        <SkillProgress learner={learner} />
        <section className={styles.explore}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Follow your curiosity</h2>
                <p>There is more than one way to find your thing.</p>
              </div>
              <Link href="/labs">
                All labs <ArrowRight size={15} />
              </Link>
            </div>
            <div className={styles.miniGrid}>
              {labs
                .filter((lab) =>
                  [
                    "first-steps",
                    "cipher-zero",
                    "hidden-in-plain-sight",
                  ].includes(lab.slug),
                )
                .map((lab) => (
                  <LabCard key={lab.slug} lab={lab} />
                ))}
            </div>
          </section>
        </div>
        <aside className={styles.rail}>
          <section className={styles.panel}>
            <span className={styles.panelIcon}>
              <Target size={21} />
            </span>
            <h2>A little goal for today</h2>
            <p>
              {today
                ? "You showed up. That's how progress happens."
                : "Finish one demo lab. Small steps add up."}
            </p>
            <div className={styles.goal}>
              <span>{today ? <Check size={20} /> : "0 / 1"}</span>
              <strong>
                {today ? "Today's goal complete" : "Your first step awaits"}
              </strong>
            </div>
          </section>
          <section className={styles.panel}>
            <div className={styles.sectionHeading}>
              <h2>Your milestones</h2>
              <Award size={19} />
            </div>
            <p>A few reasons to feel proud.</p>
            <div className={styles.badges}>
              {badgesFor(learner).map((b) => (
                <div
                  key={b.name}
                  className={b.earned ? styles.earned : styles.locked}
                >
                  <span>
                    <Award size={22} />
                  </span>
                  <div>
                    <strong>{b.name}</strong>
                    <small>{b.description}</small>
                    <small>{b.earned ? "Unlocked" : "Not yet unlocked"}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className={styles.demoNote}>
            <DemoNotice />
          </div>
        </aside>
      </div>
    </div>
  );
}
