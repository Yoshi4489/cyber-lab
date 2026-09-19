import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Globe2,
  ScanSearch,
  KeyRound,
  Route,
} from "lucide-react";
import { learningPaths, getLab } from "@/lib/catalog";

export const metadata: Metadata = { title: "Learning paths" };
const icons = { web: Globe2, search: ScanSearch, key: KeyRound };

export default function PathsPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ONE STEP LEADS TO THE NEXT.</p>
          <h1>
            Find your direction<span className="accent">.</span>
          </h1>
          <p>
            A little structure for a lot of curiosity. Explore our preview
            learning paths.
          </p>
        </div>
      </div>
      <div className="path-intro">
        <Route size={32} />
        <div>
          <h2>You don’t need to know everything to begin.</h2>
          <p>
            Each path brings related labs together, starting with the
            fundamentals and building from there.
          </p>
        </div>
      </div>
      <div className="path-grid">
        {learningPaths.map((path, i) => {
          const Icon = icons[path.icon];
          const minutes = path.labSlugs.reduce(
            (sum, slug) => sum + (getLab(slug)?.minutes ?? 0),
            0,
          );
          return (
            <article className="path-card" key={path.slug}>
              <div className={`path-art path-art-${i}`}>
                <Icon size={62} strokeWidth={1} />
                <span>PATH / 0{i + 1}</span>
              </div>
              <div className="path-card-content">
                <p className="eyebrow">{path.label}</p>
                <h2>
                  <Link href={`/paths/${path.slug}`}>{path.title}</Link>
                </h2>
                <p>{path.description}</p>
                <div className="path-facts">
                  <span>
                    {path.labSlugs.length} preview{" "}
                    {path.labSlugs.length === 1 ? "lab" : "labs"}
                  </span>
                  <span>{minutes} min planned</span>
                </div>
                <Link href={`/paths/${path.slug}`} className="path-link">
                  Explore path <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
