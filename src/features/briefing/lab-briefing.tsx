import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock3,
  FlaskConical,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import type { Lab } from "@/features/catalog/data";
import { LabArt } from "@/features/catalog/lab-art";
import { DifficultyBadge } from "@/features/catalog/lab-card";
import { SaveButton } from "@/features/bookmarks/save-button";
import { StartLab } from "@/features/session/start-lab";
import styles from "./briefing.module.css";

export function LabBriefing({ lab }: { lab: Lab }) {
  return (
    <div>
      <Link href="/labs" className={styles.back}>
        <ArrowLeft size={15} />
        Back to all labs
      </Link>
      <header className={styles.heading}>
        <div>
          <p className="eyebrow">
            {lab.category.toUpperCase()} · SAMPLE BRIEFING
          </p>
          <h1>
            {lab.title}
            <span className="accent">.</span>
          </h1>
          <p>{lab.description}</p>
          <div className={styles.meta}>
            <DifficultyBadge difficulty={lab.difficulty} />
            <span>
              <Clock3 size={15} />
              {lab.minutes} minutes
            </span>
            <span>
              <Zap size={15} />
              {lab.points} demo XP
            </span>
          </div>
        </div>
        <SaveButton slug={lab.slug} title={lab.title} showLabel />
      </header>
      <div className={styles.layout}>
        <div className={styles.content}>
          <LabArt lab={lab} large />
          <section className={styles.section}>
            <p className="eyebrow">01 / YOUR STARTING POINT</p>
            <h2>A little context before you begin.</h2>
            <p>{lab.story}</p>
          </section>
          <section className={styles.section}>
            <p className="eyebrow">02 / THE BIG PICTURE</p>
            <h2>What you’ll learn</h2>
            <p>Sample objectives for the future learning experience.</p>
            <ul>
              {lab.objectives.map((item) => (
                <li key={item}>
                  <Target size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.section}>
            <p className="eyebrow">03 / BEFORE YOU BEGIN</p>
            <h2>Bring these basics.</h2>
            <ul>
              {lab.prerequisites.map((item) => (
                <li key={item}>
                  <Check size={17} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className={styles.aside}>
          <section className={styles.launch}>
            <span className={styles.icon}>
              <FlaskConical size={27} />
            </span>
            <span className={styles.label}>DEMO SESSION</span>
            <h2>Ready to give it a try?</h2>
            <p>
              Start your own simulated session. Explore the timer, finish the
              demo, and see your progress grow.
            </p>
            <StartLab slug={lab.slug} />
            <small>
              No real target is created. Your progress stays in this browser.
            </small>
            <div className={styles.reward}>
              <Sparkles size={19} />
              <span>
                A small win to look forward to
                <strong>+{lab.points} demo XP</strong>
              </span>
            </div>
            <p className={styles.once}>
              Each lab counts once. Replays are always welcome.
            </p>
          </section>
          <section className={styles.skills}>
            <h2>Skills in focus</h2>
            <div>
              {lab.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p>Learning content and real labs come in a later phase.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
