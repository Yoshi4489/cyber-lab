import Link from "next/link";
import { ArrowUpRight, Clock3, Flag } from "lucide-react";
import type { Lab } from "@/lib/catalog";
import { LabArt } from "@/components/lab-art";
import { SaveButton } from "@/components/save-button";

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: Lab["difficulty"];
}) {
  return (
    <span className={`difficulty difficulty-${difficulty.toLowerCase()}`}>
      <span className="difficulty-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {difficulty}
    </span>
  );
}

export function LabCard({ lab }: { lab: Lab }) {
  return (
    <article className="lab-card">
      <Link
        href={`/labs/${lab.slug}`}
        className="lab-art-link"
        tabIndex={-1}
        aria-hidden="true"
      >
        <LabArt lab={lab} />
      </Link>
      <div className="lab-card-body">
        <div className="lab-card-meta">
          <span className="category-label">{lab.category}</span>
          <DifficultyBadge difficulty={lab.difficulty} />
        </div>
        <h3>
          <Link href={`/labs/${lab.slug}`}>
            {lab.title}
            <ArrowUpRight size={18} />
          </Link>
        </h3>
        <p>{lab.description}</p>
        <div className="lab-tags">
          {lab.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="lab-card-footer">
          <span>
            <Clock3 size={14} />
            {lab.minutes} min
          </span>
          <span>
            <Flag size={14} />
            {lab.points} pts
          </span>
          <SaveButton slug={lab.slug} title={lab.title} />
        </div>
      </div>
    </article>
  );
}
