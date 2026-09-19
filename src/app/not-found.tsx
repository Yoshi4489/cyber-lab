import Link from "next/link";
import { Radar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="empty-state not-found">
      <Radar size={42} />
      <p className="eyebrow">404 / OUTSIDE THE RANGE</p>
      <h1>This trail goes quiet.</h1>
      <p>That page or lab doesn’t exist. There’s plenty more to explore.</p>
      <Button asChild>
        <Link href="/">Back to the range</Link>
      </Button>
    </div>
  );
}
