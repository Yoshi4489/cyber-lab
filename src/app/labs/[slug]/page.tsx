import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Flag,
  LockKeyhole,
  Target,
} from "lucide-react";
import { getLab, labs } from "@/features/catalog/data";
import { LabArt } from "@/features/catalog/lab-art";
import { DifficultyBadge } from "@/features/catalog/lab-card";
import { SaveButton } from "@/features/bookmarks/save-button";
import { StartLab } from "@/features/session/start-lab";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string }> };
// The preview catalog is finite; reject unknown slugs before streaming begins.
export const dynamicParams = false;

export function generateStaticParams() {
  return labs.map((lab) => ({ slug: lab.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lab = getLab((await params).slug);
  return {
    title: lab?.title ?? "Lab not found",
    description: lab?.description,
  };
}

export default async function LabPage({ params }: Props) {
  const lab = getLab((await params).slug);
  if (!lab) notFound();
  return (
    <>
      <Link href="/" className="back-link">
        <ArrowLeft size={15} />
        Back to all labs
      </Link>
      <div className="detail-heading">
        <div>
          <div className="detail-labels">
            <span className="eyebrow">{lab.code}</span>
            <Badge>PREVIEW LAB</Badge>
          </div>
          <h1>
            {lab.title}
            <span className="accent">.</span>
          </h1>
          <p>{lab.description}</p>
          <div className="detail-meta">
            <DifficultyBadge difficulty={lab.difficulty} />
            <span>
              <Clock3 size={15} />
              {lab.minutes} minutes
            </span>
            <span>
              <Flag size={15} />
              {lab.points} planned points
            </span>
          </div>
        </div>
        <SaveButton slug={lab.slug} title={lab.title} showLabel />
      </div>
      <div className="detail-layout">
        <div className="briefing">
          <LabArt lab={lab} large />
          <section className="briefing-section">
            <p className="eyebrow">01 / THE BRIEFING</p>
            <h2>Every lab has a story.</h2>
            <p>{lab.story}</p>
          </section>
          <section className="briefing-section">
            <p className="eyebrow">02 / THE TAKEAWAYS</p>
            <h2>What you’ll learn</h2>
            <ul className="objectives">
              {lab.objectives.map((objective) => (
                <li key={objective}>
                  <Target size={17} />
                  {objective}
                </li>
              ))}
            </ul>
          </section>
          <section className="briefing-section">
            <p className="eyebrow">03 / BEFORE YOU BEGIN</p>
            <h2>Bring these basics</h2>
            <ul className="objectives prerequisites">
              {lab.prerequisites.map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="lab-sidebar">
          <div className="launch-panel">
            <div className="launch-icon">
              <LockKeyhole size={24} />
            </div>
            <Badge>DEMO SESSION</Badge>
            <h2>Your own little learning space.</h2>
            <p>
              Try a simulated session with a countdown and sample rewards.
              Choose a demo username first. Real lab access comes later.
            </p>
            <StartLab slug={lab.slug} />
            <span className="launch-note">
              UI simulation only. No real instance is created.
            </span>
            <div className="launch-divider" />
            <h3>Make the most of the preview</h3>
            <p>
              Explore the objectives, save this lab, or get familiar with the
              range.
            </p>
            <Link href="/guide" className="text-link">
              Read the field guide <ArrowRight size={14} />
            </Link>
          </div>
          <div className="skills-panel">
            <p className="eyebrow">SKILLS IN FOCUS</p>
            <div className="lab-tags">
              {lab.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p>
              Category <strong>{lab.category}</strong>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
