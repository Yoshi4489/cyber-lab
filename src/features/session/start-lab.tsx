"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearner } from "@/features/learner/store";
import { startSession } from "./actions";

export function StartLab({ slug }: { slug: string }) {
  const { learner, ready } = useLearner();
  const router = useRouter();
  if (!ready)
    return (
      <Button disabled className="full-width">
        Getting ready…
      </Button>
    );
  if (!learner.signedIn)
    return (
      <Button asChild className="full-width">
        <Link href={`/signup?lab=${slug}`}>
          Start Lab <ArrowRight size={16} />
        </Link>
      </Button>
    );
  return (
    <Button
      className="full-width"
      onClick={() => {
        startSession(slug);
        router.push(`/labs/${slug}/session`);
      }}
    >
      <Play size={15} /> Start Lab
    </Button>
  );
}
