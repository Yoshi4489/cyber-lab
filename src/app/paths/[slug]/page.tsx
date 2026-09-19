import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { learningPaths, getLab } from "@/lib/catalog";
import { DifficultyBadge } from "@/components/lab-card";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return learningPaths.map((path) => ({ slug: path.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title:
      learningPaths.find((path) => path.slug === slug)?.title ??
      "Path not found",
  };
}

export default async function PathPage({ params }: Props) {
  const { slug } = await params;
  const path = learningPaths.find((item) => item.slug === slug);
  if (!path) notFound();
  return (
    <>
      <Link href="/paths" className="back-link">
        <ArrowLeft size={15} />
        All learning paths
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{path.label}</p>
          <h1>
            {path.title}
            <span className="accent">.</span>
          </h1>
          <p>{path.description}</p>
        </div>
      </div>
      <p className="path-preview-note">
        Suggested order · Preview briefings · Completion tracking arrives with
        live labs
      </p>
      <div className="path-timeline">
        {path.labSlugs.map((labSlug, index) => {
          const lab = getLab(labSlug)!;
          return (
            <article className="path-step" key={labSlug}>
              <span className="step-number">0{index + 1}</span>
              <div>
                <span className="eyebrow">{lab.category}</span>
                <h2>
                  <Link href={`/labs/${lab.slug}`}>{lab.title}</Link>
                </h2>
                <p>{lab.description}</p>
                <div className="detail-meta">
                  <DifficultyBadge difficulty={lab.difficulty} />
                  <span>
                    <Clock3 size={14} />
                    {lab.minutes} min
                  </span>
                </div>
              </div>
              <Link
                href={`/labs/${lab.slug}`}
                className="step-link"
                aria-label={`Open ${lab.title} briefing`}
              >
                <ArrowUpRight size={22} />
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
