"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FlaskConical,
  LockKeyhole,
  RotateCcw,
  Square,
} from "lucide-react";
import type { Lab } from "@/features/catalog/data";
import { Button } from "@/components/ui/button";
import { useLearner } from "@/features/learner/store";
import { DemoNotice } from "@/features/learner/demo-notice";
import { totalXp } from "@/features/learner/model";
import { useClock } from "@/hooks/use-clock";
import { finishSession, stopSession } from "./actions";
import { StartLab } from "./start-lab";
import styles from "./session.module.css";

function timeLeft(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function SessionPanel({ lab }: { lab: Lab }) {
  const { learner, ready } = useLearner();
  const now = useClock();
  if (!ready) return <p role="status">Getting your demo session ready…</p>;
  const session = learner.signedIn ? learner.sessions[lab.slug] : undefined;
  const completed =
    learner.signedIn && learner.completions[lab.slug] !== undefined;
  const expired = session && session.expiresAt <= now;
  const running = session && !expired;
  return (
    <div className={styles.page}>
      <Link href={`/labs/${lab.slug}`} className={styles.back}>
        <ArrowLeft size={15} /> Back to briefing
      </Link>
      <header>
        <p className="eyebrow">YOUR PERSONAL DEMO SESSION</p>
        <h1>{lab.title}</h1>
        <p>Try the learning flow. Every action on this page is simulated.</p>
      </header>
      <section className={styles.panel} aria-label="Lab session">
        <div className={styles.top}>
          <span className={styles.icon}>
            {completed && !session ? (
              <CheckCircle2 size={26} />
            ) : (
              <FlaskConical size={26} />
            )}
          </span>
          <span className={styles.status}>
            {running
              ? "Running · demo"
              : expired
                ? "Expired · demo"
                : completed
                  ? "Completed · demo"
                  : "Not started · demo"}
          </span>
        </div>
        {running ? (
          <>
            <h2>A space to explore.</h2>
            <p>
              Your simulated instance is ready. Real lab access and learning
              activities will arrive in a later phase.
            </p>
            <div className={styles.timer}>
              <Clock3 size={22} />
              <div>
                <span>Time remaining</span>
                <strong role="timer" aria-label="Time remaining">
                  {timeLeft(session.expiresAt - now)}
                </strong>
              </div>
              <span>Demo session</span>
            </div>
            <dl className={styles.details}>
              <div>
                <dt>Instance name</dt>
                <dd>demo-{lab.slug}</dd>
              </div>
              <div>
                <dt>Environment</dt>
                <dd>Browser simulation</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>No target connected</dd>
              </div>
            </dl>
            <Button disabled className="full-width">
              <LockKeyhole size={16} /> Lab access coming later
            </Button>
            <div className={styles.finish}>
              <h3>Try the completion experience</h3>
              <p>
                Use the button below to see a sample reward and update your demo
                progress. No challenge is being graded.
              </p>
              <Button
                className="full-width"
                onClick={() => finishSession(lab.slug)}
              >
                Finish Lab <CheckCircle2 size={16} />
              </Button>
              <span>Simulated completion · each lab awards demo XP once</span>
            </div>
            <Button variant="ghost" onClick={() => stopSession(lab.slug)}>
              <Square size={13} /> Stop demo session
            </Button>
          </>
        ) : expired ? (
          <>
            <h2>Time for a fresh start.</h2>
            <p>
              This demo session has expired. No XP was added. Start it again
              whenever you are ready.
            </p>
            <StartLab slug={lab.slug} />
          </>
        ) : completed ? (
          <>
            <h2>One small step. Nicely done.</h2>
            <p>
              Your simulated completion is recorded. This lab contributes{" "}
              {lab.points} demo XP to your progress, counted once even if you
              replay it.
            </p>
            <div className={styles.reward}>
              <CheckCircle2 size={35} />
              <strong>
                {totalXp(learner)}
                <small>Total demo XP</small>
              </strong>
            </div>
            <Button asChild className="full-width">
              <Link href="/dashboard">
                See your progress <ArrowRight size={16} />
              </Link>
            </Button>
            <div className={styles.replay}>
              <RotateCcw size={15} />
              <span>Want another look? Replays do not add extra XP.</span>
            </div>
            <StartLab slug={lab.slug} />
          </>
        ) : (
          <>
            <h2>
              {learner.signedIn
                ? "Your next discovery awaits."
                : "Make this space yours."}
            </h2>
            <p>
              {learner.signedIn
                ? "Start a new simulated session and try the learning flow."
                : "Choose a demo username before starting. You can still explore all the sample briefings as a guest."}
            </p>
            <StartLab slug={lab.slug} />
          </>
        )}
        <div className={styles.notice}>
          <DemoNotice />
        </div>
      </section>
    </div>
  );
}
