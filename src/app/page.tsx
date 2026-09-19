import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Route,
  ShieldCheck,
} from "lucide-react";
import { Catalog } from "@/features/catalog/catalog";
import { RangeIllustration } from "@/features/catalog/lab-art";
import { Button } from "@/components/ui/button";
import { labs } from "@/features/catalog/data";

export default function Home() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LESS THEORY. MORE DISCOVERY.</p>
          <h1>
            Welcome to the range<span className="accent">.</span>
          </h1>
          <p>Your next skill starts with a little curiosity.</p>
        </div>
        <span className="edition-label">
          <span />
          EARLY ACCESS / 001
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span />
            YOUR CURIOSITY. YOUR PLAYGROUND.
          </span>
          <h2>
            Break things.
            <br />
            Build something <em>better.</em>
          </h2>
          <p>
            Real-world scenarios. A space to experiment.
            <br />
            Turn “what if” into “now I know.”
          </p>
          <div className="hero-actions">
            <Button asChild>
              <a href="#lab-catalog">
                Find your first lab <ArrowRight size={16} />
              </a>
            </Button>
            <Link href="/guide" className="hero-secondary">
              How it works <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <RangeIllustration />
        <span className="hero-bottom-label">
          {"// A LITTLE CHAOS. A LOT OF LEARNING."}
        </span>
      </section>
      <div className="value-strip">
        <div>
          <Crosshair size={17} />
          <span>
            <strong>Hands-on by design</strong>Learn through exploration
          </span>
        </div>
        <div>
          <Route size={17} />
          <span>
            <strong>Choose your own path</strong>From first steps to deep dives
          </span>
        </div>
        <div>
          <ShieldCheck size={18} />
          <span>
            <strong>A range built for practice</strong>Private labs are coming
            soon
          </span>
        </div>
      </div>
      <Catalog labs={labs} />
      <div className="preview-note">
        <span className="small-dot" />
        <p>
          You’re exploring a preview catalog. Briefings and bookmarks are ready;
          live labs and scoring are on the way.
        </p>
        <Link href="/guide">
          About this preview <ArrowUpRight size={13} />
        </Link>
      </div>
    </>
  );
}
