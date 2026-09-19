import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Flag,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { BackendStatus } from "@/features/backend/backend-status";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Field guide" };

export default function GuidePage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A FEW THINGS BEFORE YOU DIVE IN.</p>
          <h1>
            Your field guide<span className="accent">.</span>
          </h1>
          <p>
            A good place to start, whether this is your first lab or your
            fiftieth.
          </p>
        </div>
      </div>
      <div className="guide-layout">
        <div>
          <section className="guide-section">
            <h2>Learn by asking “what if?”</h2>
            <p>
              Cyber Range is a hands-on security training platform. Each
              challenge is a small investigation: explore an unfamiliar system,
              understand its weaknesses, and explain what you found.
            </p>
            <div className="guide-step">
              <Compass size={21} />
              <div>
                <h3>01. Find something interesting</h3>
                <p>
                  Browse by category, skill, or difficulty. Open a briefing to
                  see the story, learning objectives, and prerequisites. Save
                  the ones you want to return to.
                </p>
              </div>
            </div>
            <div className="guide-step">
              <FlaskConical size={21} />
              <div>
                <h3>02. Explore your own lab</h3>
                <p>
                  Once the live range opens, supported challenges will launch a
                  private target with a limited lifetime. Only attack the target
                  assigned to you.
                </p>
              </div>
            </div>
            <div className="guide-step">
              <Flag size={21} />
              <div>
                <h3>03. Capture the lesson</h3>
                <p>
                  Live challenges will let you submit a flag as evidence of a
                  solve. The real takeaway is understanding the weakness and how
                  to prevent it.
                </p>
              </div>
            </div>
          </section>
          <section className="guide-section" id="ground-rules">
            <h2>Curiosity, with a clear boundary.</h2>
            <p>
              Targets are intentionally vulnerable. The platform, other players,
              and systems outside your assigned lab are outside the exercise.
            </p>
            <ul className="ground-rules">
              <li>
                Practice only against targets you have explicit permission to
                test.
              </li>
              <li>
                Keep discoveries about the hosting platform private and report
                them to the operator.
              </li>
              <li>Do not use a lab to scan or attack external systems.</li>
              <li>
                Share what you learned without sharing other players’ private
                data.
              </li>
            </ul>
          </section>
          <section className="guide-section">
            <h2>What works in this preview?</h2>
            <p>
              You can explore six example briefings, filter the catalog, follow
              three learning paths, and save labs in this browser. Bookmarks are
              local to this device and are not an account.
            </p>
            <p>
              Registration, runnable targets, challenge downloads, flag
              submission, and scoring are still being built. Planned points and
              durations describe the intended labs.
            </p>
            <Button asChild>
              <Link href="/">
                Find your next challenge <ArrowRight size={16} />
              </Link>
            </Button>
          </section>
        </div>
        <aside>
          <div className="guide-aside">
            <ShieldCheck size={26} />
            <h3>Your curiosity belongs here.</h3>
            <p>
              Start small. Read the briefing. Take notes. Getting stuck is part
              of learning, and understanding one thing well is progress.
            </p>
            <Link href="/paths" className="text-link">
              Try a learning path <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>
      <BackendStatus />
    </>
  );
}
