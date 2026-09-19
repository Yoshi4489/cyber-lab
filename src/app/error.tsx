"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state not-found">
      <p className="eyebrow">CONNECTION INTERRUPTED</p>
      <h1>We lost the trail.</h1>
      <p>
        Something went wrong while loading this page. Try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
